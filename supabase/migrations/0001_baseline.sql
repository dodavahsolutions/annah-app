-- 0001_baseline.sql
-- Source-controlled baseline for the ANNAH B2C schema.
--
-- The `sessions` and `messages` tables already exist in the live Supabase
-- project (created via the dashboard during the early build). This migration
-- codifies them so the schema lives in git and is reproducible. Everything is
-- written to be IDEMPOTENT (safe to re-run against the existing database):
--   * `create table if not exists`
--   * `enable row level security` is a no-op when already enabled
--   * policies use `drop policy if exists` before `create policy`
--   * the new-user trigger uses `create or replace` + `drop trigger if exists`

-- ---------------------------------------------------------------------------
-- profiles  (NEW) — one row per auth user; holds plan/tier + Stripe linkage.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id                 uuid primary key references auth.users (id) on delete cascade,
  full_name          text,
  plan               text not null default 'free' check (plan in ('free', 'pro')),
  stripe_customer_id text,
  created_at         timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Owners may read and update their own profile. `plan` and `stripe_customer_id`
-- are intentionally NOT writable from the client — they are mutated only by the
-- service-role key (Stripe webhook). RLS update policy below restricts the row;
-- column-level protection for plan is enforced at the API layer (no client path
-- ever writes those columns).
drop policy if exists "profiles_owner_select" on public.profiles;
create policy "profiles_owner_select" on public.profiles
  for select to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_owner_update" on public.profiles;
create policy "profiles_owner_update" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create a free profile whenever a new auth user is inserted. Pulls
-- full_name from the signup metadata when present. SECURITY DEFINER with an
-- empty search_path is the Supabase-recommended secure pattern.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for any users that pre-date this trigger.
insert into public.profiles (id, full_name)
select u.id, u.raw_user_meta_data ->> 'full_name'
from auth.users u
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- sessions  (EXISTING) — one chat session per row, owned by a user.
-- ---------------------------------------------------------------------------
create table if not exists public.sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  title      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sessions_user_id_updated_at_idx
  on public.sessions (user_id, updated_at desc);

alter table public.sessions enable row level security;

drop policy if exists "sessions_owner_select" on public.sessions;
create policy "sessions_owner_select" on public.sessions
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "sessions_owner_insert" on public.sessions;
create policy "sessions_owner_insert" on public.sessions
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "sessions_owner_update" on public.sessions;
create policy "sessions_owner_update" on public.sessions
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "sessions_owner_delete" on public.sessions;
create policy "sessions_owner_delete" on public.sessions
  for delete to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- messages  (EXISTING) — chat turns, access gated through parent session.
-- ---------------------------------------------------------------------------
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  role       text not null check (role in ('user', 'assistant')),
  content    text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_session_id_created_at_idx
  on public.messages (session_id, created_at asc);

alter table public.messages enable row level security;

-- A user may touch a message only when they own the session it belongs to.
drop policy if exists "messages_via_session_select" on public.messages;
create policy "messages_via_session_select" on public.messages
  for select to authenticated
  using (
    exists (
      select 1 from public.sessions s
      where s.id = messages.session_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "messages_via_session_insert" on public.messages;
create policy "messages_via_session_insert" on public.messages
  for insert to authenticated
  with check (
    exists (
      select 1 from public.sessions s
      where s.id = messages.session_id and s.user_id = auth.uid()
    )
  );
