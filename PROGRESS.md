# ANNAH B2C — Build Progress (Memory File)

> Source-of-truth tracker for the remaining B2C roadmap. Update this file as
> sprints land. The full plan lives at
> `~/.claude/plans/sprightly-yawning-sutton.md`.
>
> **Last updated:** 2026-05-26

---

## Status at a Glance

| Sprint | Theme | Phase | Status |
|---|---|---|---|
| **A** | DB schema codification + Lead capture & referral | 1 & 2 | ✅ **Done — shipped to prod** |
| **B** | Public content & SEO pages | 2 & 3 | ✅ **Done — built, verified, pushed (`f2a723d`)** |
| **C** | Transactional email (Resend) + blog/content | 3 | ⬜ Not started |
| **D** | Stripe + real freemium + Pro tier + rate alerts | 4 | ⬜ Not started |
| **E** | Compliance pages, PostHog, FCA review, QA, launch | 5 | ⬜ Not started |

---

## ✅ Sprint A — DB Schema Foundation + Lead Capture (COMPLETE)

Committed (`6e59ffd`), pushed to `origin/main`, deployed to Vercel (state=success),
and verified live (OPTIONS /api/leads → 204, invalid POST → 400, marketing/auth
routes → 200).

### A1. Codify existing schema into migrations — ✅
- `supabase/migrations/0001_baseline.sql` — idempotent baseline.
  - `profiles` (new): `id → auth.users`, `full_name`, `plan` ('free'|'pro' default 'free'), `stripe_customer_id`, `created_at`. Owner-only RLS (select/update). `plan`/`stripe_customer_id` only writable by service role.
  - `handle_new_user()` trigger (SECURITY DEFINER, `set search_path = ''`) auto-creates a free profile on `auth.users` insert + backfills existing users.
  - `sessions` + `messages` (existing) codified with owner-only RLS; messages gated via parent-session ownership.
- **Verified:** all 4 tables exist in live Supabase with `relrowsecurity = true` (confirmed via dashboard).

### A2. `leads` table + lead scoring — ✅
- `supabase/migrations/0002_leads.sql` — `leads` table (GDPR audit log: consent text + timestamp + IP). RLS: single `leads_public_insert` policy (INSERT for anon+authenticated, check true); **no select/update/delete for public** (PII unreadable from browser; broker reads via service-role only). Confirmed live.
- `src/lib/lead-scoring.ts` — pure `scoreLead()` 0–100. Weights: budget 40 + timeline 30 + engagement 20 + scheme 5 + doc 5.
- `src/lib/lead-scoring.test.ts` — 13 vitest tests, all passing.

### A3. Lead capture API + service-role client — ✅
- `src/lib/supabase/admin.ts` — `server-only` service-role client (bypasses RLS).
- `src/app/api/leads/route.ts` — OPTIONS + POST. CORS → rate-limit → Zod validate → `scoreLead()` server-side → admin insert → optional CRM webhook (`LEADS_WEBHOOK`, non-fatal). `ApiResponse<T>` envelope.
- `src/lib/cors.ts` — `buildCorsHeaders()` extracted from anna route (now shared).
- `src/lib/rate-limit.ts` — rewritten: shared `getRedis()`; `checkAnnaRateLimit` + new `checkLeadRateLimit` (3/min/IP); `getClientIp()`.

### A4. Lead capture UI + trigger — ✅
- `src/components/lead/LeadCaptureDialog.tsx` — controlled-state form (name, email, phone, area, budget, timeline, schemes, GDPR consent checkbox). Posts to `/api/leads`.
- `src/hooks/useLeadTrigger.ts` — auto-opens dialog at 5+ user messages; `localStorage` ('annah:lead:status') so it never nags. Exposes `trigger()` for calculator-completion (not yet wired).
- `src/components/ChatArea.tsx` — wired message-count trigger + dialog.
- `src/content/areas.ts` (32 Scottish council areas), `src/content/schemes.ts` (5 schemes).
- Tooling: `vitest.config.ts`, vitest + coverage + `server-only` deps, `.env.example` updated (`LEADS_WEBHOOK`).

### ✅ Sprint A — manual verification (DONE)
- [x] `SUPABASE_SERVICE_ROLE_KEY` set in Vercel env. *(confirmed 2026-05-24)*
- [x] Real UI e2e: 5 chat messages → broker dialog opens → submit → lead row lands. *(confirmed 2026-05-24)*

### Sprint A — deferred / scoped-out
- Calculator-completion lead trigger (hook exposes `trigger()`; only the 5-message trigger is wired today).
- Lead confirmation email — depends on Sprint C (Resend); API has a comment marking the hook point.

---

## ✅ Sprint B — Public Content & SEO Pages (COMPLETE)

Target: 2,000 organic visitors/mo by month 6. Chat app stays at `/`; marketing
pages live in a `(marketing)` route group with their own shell.

### B1. Marketing shell + SEO infra — ✅
- `src/lib/seo.ts` — `SITE` config, `absoluteUrl()`, `pageMetadata()` (canonical + OG/Twitter), and JSON-LD builders: Organization, WebSite, FAQPage, Article, FinancialService (LocalBusiness), BreadcrumbList.
- `src/app/(marketing)/layout.tsx` — public shell emitting Organization + WebSite JSON-LD; `MarketingHeader.tsx` (sticky nav + mobile sheet menu), `MarketingFooter.tsx` (nav + non-advice disclaimer).
- `src/components/marketing/` — `JsonLd.tsx`, `primitives.tsx` (Section, Breadcrumbs, PageHero, CtaBanner, Prose).
- `src/content/nav.ts` — single source for header/footer/sitemap links.
- `src/app/sitemap.ts` (40 URLs: home + 7 static + 32 areas) and `src/app/robots.ts` (disallows /api,/login,/signup,/auth).
- **Viewport-lock fix:** `globals.css` now scopes the full-viewport lock to a `.chat-locked` class (added by the chat page on mount) so marketing pages scroll the document normally. Verified: `/` stays locked (scrollHeight == innerHeight), marketing pages scroll.

### B2. Static pages + content — ✅
- Content data: `src/content/faq.ts` (4 categories), `src/content/glossary.ts` (22 A–Z terms), `src/content/services.ts` (6 services).
- Pages: `/about`, `/services`, `/schemes` (pillar + Article JSON-LD), `/calculators` (reuses the 7 client calculators via `MarketingCalculators.tsx`, deep-linkable `#id` anchors), `/faq` (accordion + FAQPage JSON-LD), `/glossary` (A–Z grouped). All have canonical + per-page Metadata + Breadcrumbs.

### B3. Area guides (32 councils) — ✅
- `src/content/areas.ts` enriched with `region`/`towns`/`intro`/`marketNote` per area (slug + name kept stable for the Sprint A lead picker + sitemap).
- `(marketing)/areas/page.tsx` (region-grouped index) + `areas/[slug]/page.tsx` with `generateStaticParams` (32 SSG paths), `generateMetadata`, and FinancialService (LocalBusiness) JSON-LD. Deep-links to calculator anchors + schemes.

### ✅ Verification
- [x] `next build` green — 50 static pages incl. 32 area routes (SSG), `sitemap.xml`, `robots.txt`.
- [x] SSR HTML checked on all 8 routes: correct canonical, h1, and structured data (Article on /schemes; FAQPage+Q&A on /faq; FinancialService+AdministrativeArea on area pages; Breadcrumb/Org/WebSite throughout).
- [x] Responsive at 320 / 375 / desktop — no horizontal overflow; mobile nav collapses to hamburger.
- [ ] Lighthouse SEO ≥ 95 — not run (needs a browser pass against a deploy; SSR meta/structured-data audited manually instead).

### Sprint B — deferred / notes
- Lighthouse SEO ≥ 95 still wants a real browser pass against a deploy (SSR meta + structured data audited manually only).

---

## ✅ Post-Sprint-B fix — Guest-only auth resilience (COMPLETE, `8fa9422`)

Found while verifying Sprint B locally and fixed end-to-end (pushed to `origin/main`).

- **Bug:** `src/lib/supabase/client.ts` `createClient()` *threw* when `NEXT_PUBLIC_SUPABASE_URL`/`_ANON_KEY` were blank, crashing **every** page at browser hydration — contradicting the default-allow contract documented in `middleware.ts` and `.env.local` ("blank vars → guest-only").
- **Fix (5 files, +38/−13):**
  - `client.ts` — returns `null` (+ `isSupabaseConfigured()`) instead of throwing.
  - `context/AuthContext.tsx` — guards `useEffect` + `signOut`; falls back to `{ user: null, loading: false }`.
  - `components/ChatArea.tsx`, `(auth)/login`, `(auth)/signup` — guard each `createClient()` call site (auth pages show a "continue as a guest" message).
- **Verified:** `next build` green; with blank env the app renders guest-only (the "Guest / First-time buyer" card shows) instead of the "Missing environment variable" error overlay. Production unaffected (vars set in Vercel).

---

## ✅ Security hardening — Supabase linter warnings (migration `0003`)

Triggered by the Supabase Performance/Security linter (6 warnings) against the
live project. Migration `supabase/migrations/0003_security_hardening.sql` (idempotent).

- **`leads_public_insert` dropped** — the `WITH CHECK (true)` INSERT policy for
  anon/authenticated was unnecessary: leads are inserted only via the service-role
  key in `/api/leads` (bypasses RLS), and the only `.from('leads')` call is that
  admin route. Dropping it removes a public write path nothing used. RLS stays on
  with no policy → anon/authenticated get zero access; service-role insert unaffected.
  *(Supersedes the Sprint A2 note describing `leads_public_insert` as live.)*
- **`handle_new_user()` EXECUTE revoked** from anon/authenticated/public — stays a
  `SECURITY DEFINER` trigger function but is no longer callable via `/rest/v1/rpc/`.
- **`rls_auto_enable()` EXECUTE revoked** (guarded `DO` block, no-op if absent).
  Confirmed legitimate (2026-05-26): it's an **event-trigger function** that
  auto-enables RLS on any new `public` table via `pg_event_trigger_ddl_commands()`.
  **Keep it** — revoke only (it can't run via RPC anyway, the linter just flags the
  EXECUTE grant). Do NOT drop.

### Remaining manual actions
- [x] Apply migration `0003` (run via dashboard SQL editor). *(2026-05-26)* — clears warnings 1–5.
- [~] **Leaked password protection** (warning 6): **Pro-plan only** — cannot be enabled
      on the free plan (dashboard returns "available on Pro Plans and up"). Accepted as a
      known limitation (WARN, not CRITICAL). Free-tier mitigation: set min password length
      + required character types under Authentication → Providers → Password. Optional
      future work: implement the HaveIBeenPwned Pwned Passwords range API (free/keyless,
      k-anonymity) in the signup path — slot into a sprint.
- [x] Inspect `rls_auto_enable` — confirmed legitimate event-trigger function; keep + revoke (done in `0003`). *(2026-05-26)*

---

## ⬜ Sprint C — Transactional Email + Content (Phase 3)
- `resend` + `react-email`; `src/lib/email/` templates: welcome, lead confirmation (wire into `/api/leads`), rate-alert (D). Env: `RESEND_API_KEY`, `EMAIL_FROM`.
- Blog: `/blog` + `/blog/[slug]` (MDX or `src/content/blog/`), Article JSON-LD, RSS.

## ⬜ Sprint D — Monetisation: Stripe + Freemium + Pro (Phase 4)
- Real free-tier limits (10 msgs/session, 1 doc, 4 basic calculators) enforced server-side in `/api/anna` (read `profiles.plan`) + client gating.
- Stripe: `api/stripe/checkout`, `api/stripe/webhook` (sync `profiles.plan`/`stripe_customer_id`), customer portal. Env: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, price IDs.
- `/pricing` page + upgrade CTAs. `/dashboard` (auth-only — add gate in `middleware.ts`): sessions list, saved scenarios, rate alerts (`rate_alerts` table + Vercel Cron → Resend), journey tracker.

## ⬜ Sprint E — Compliance, Analytics & Launch (Phase 5)
- Compliance (launch blocker): `/privacy`, `/terms`, `/cookies`, cookie-consent banner, expand AI/"not regulated advice" disclaimers.
- PostHog (`posthog-js`, consent-gated), funnel events (chat→lead, free→pro).
- FCA financial-promotion review, mobile QA, security-reviewer pass over leads/Stripe/auth, retention jobs (90d free / 2y pro).

---

## Env Vars Ledger
| Var | Sprint | Status |
|---|---|---|
| `ANTHROPIC_API_KEY` | (existing) | ✅ set |
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | (existing) | ✅ set |
| `SUPABASE_SERVICE_ROLE_KEY` | A | ✅ set in Vercel |
| `NEXT_PUBLIC_SITE_URL` | (existing, CORS) | ✅ |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | (existing) | optional (rate-limit off if unset) |
| `LEADS_WEBHOOK` | A | optional |
| `RESEND_API_KEY` / `EMAIL_FROM` | C | ⬜ |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / price IDs | D | ⬜ |
| `NEXT_PUBLIC_POSTHOG_KEY` | E | ⬜ |
