-- 0003_security_hardening.sql
-- Resolves the Supabase security linter warnings for the ANNAH project.
-- Idempotent (safe to re-run): uses `drop ... if exists`, `revoke` (no-op when
-- the grant is already absent), and guarded `DO` blocks for functions that may
-- not exist in every environment.
--
-- Warnings addressed:
--   * rls_policy_always_true                       -> leads_public_insert dropped
--   * anon/authenticated_security_definer_function -> handle_new_user() execute revoked
--   * anon/authenticated_security_definer_function -> rls_auto_enable() execute revoked (guarded)
--
-- NOT addressed here (manual dashboard action):
--   * auth_leaked_password_protection -> enable under
--     Authentication > Providers > Password > "Check against HaveIBeenPwned".

-- ---------------------------------------------------------------------------
-- leads: drop the public INSERT policy.
--
-- Lead capture runs exclusively through /api/leads using the service-role key
-- (src/lib/supabase/admin.ts), which BYPASSES RLS. No browser/anon code path
-- ever inserts directly (verified: the only `.from('leads')` call is the admin
-- route). The `WITH CHECK (true)` policy was therefore unnecessary and let any
-- holder of the anon key write arbitrary rows. With RLS enabled and no policy,
-- anon/authenticated get zero access while the service-role insert is unaffected.
-- ---------------------------------------------------------------------------
drop policy if exists "leads_public_insert" on public.leads;

-- ---------------------------------------------------------------------------
-- handle_new_user(): trigger-only function, must not be callable via REST RPC.
--
-- It stays SECURITY DEFINER (required so the trigger can insert into profiles
-- regardless of the inserting role), but the API-facing roles have no business
-- invoking it through /rest/v1/rpc/handle_new_user. Revoke their EXECUTE.
-- ---------------------------------------------------------------------------
revoke execute on function public.handle_new_user() from anon, authenticated, public;

-- ---------------------------------------------------------------------------
-- rls_auto_enable(): not defined in these migrations (created via the dashboard
-- or an extension). Revoke EXECUTE from the API roles if it exists. Guarded so
-- this migration does not fail in environments where the function is absent.
--
-- If you confirm this helper is unused, replace the revoke with a drop:
--   drop function if exists public.rls_auto_enable();
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'rls_auto_enable'
      and p.pronargs = 0
  ) then
    revoke execute on function public.rls_auto_enable() from anon, authenticated, public;
  end if;
end
$$;
