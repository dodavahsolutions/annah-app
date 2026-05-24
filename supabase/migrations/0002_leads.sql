-- 0002_leads.sql
-- Lead capture & referral. A lead is a buyer who has engaged enough to be
-- handed to a regulated broker partner (plan §2.4).
--
-- This table doubles as the GDPR consent audit log: the exact consent text,
-- the timestamp, and the source IP are captured at submission time.

create table if not exists public.leads (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  -- Nullable: guests (anonymous users) can submit leads too.
  user_id             uuid references auth.users (id) on delete set null,
  name                text not null,
  email               text not null,
  phone               text,
  purchase_area       text,
  budget              integer,
  timeline            text,
  scheme_interest     text[] not null default '{}',
  -- 0–100, computed server-side only (never trust a client-sent score).
  score               integer not null default 0 check (score between 0 and 100),
  engagement_messages integer not null default 0,
  -- GDPR audit fields.
  consent             boolean not null default false,
  consent_text        text,
  consent_at          timestamptz,
  source_ip           text,
  status              text not null default 'new'
                        check (status in ('new', 'contacted', 'qualified', 'converted', 'rejected'))
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_score_idx on public.leads (score desc);

alter table public.leads enable row level security;

-- Anyone (anon or authenticated) may INSERT a lead — guests must be able to
-- submit. There is deliberately NO select/update/delete policy for public
-- roles, so the anon/authenticated keys can never read leads back. Broker and
-- admin reads happen exclusively through the service-role key, which bypasses
-- RLS. This keeps PII (name/email/phone) unreadable from the browser.
drop policy if exists "leads_public_insert" on public.leads;
create policy "leads_public_insert" on public.leads
  for insert to anon, authenticated
  with check (true);
