# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

**Anna** (project codename "ANNAH") is a Scotland-focused mortgage advisor web app. It
combines a Claude-powered chat assistant with 7 Scotland-aware mortgage calculators,
client-side PDF document upload, Supabase auth + chat-history persistence, lead capture
(stored in Supabase + optional CRM webhook), and a public SEO/marketing site.

It is a **Next.js 15 App Router** app (not Vite — earlier revisions were Vite; that is gone).

> **Roadmap & status:** see `PROGRESS.md` (the source-of-truth memory file). Sprints A and B
> are done; C–E are ahead. Read it before starting roadmap work.

## Commands

```bash
npm run dev            # Next.js dev server → http://localhost:3000
npm run build          # Production build (also type-checks)
npm run start          # Serve the production build
npm run lint           # next lint (ESLint)
npm run test           # vitest (watch)
npm run test:run       # vitest run (CI / one-shot)
npm run test:coverage  # vitest run with coverage
```

`postinstall` copies the pdf.js worker into `public/` (`copy-pdf-worker`). ESLint is
**not** run during `next build` (`eslint.ignoreDuringBuilds: true` in `next.config.ts`) —
type-checking still gates the build. Run `npm run lint` separately.

## Environment Variables

See `.env.example` for the full list. For local dev, copy it to `.env.local`.

| Variable | Where used | Required |
|---|---|---|
| `ANTHROPIC_API_KEY` | `src/app/api/anna/route.ts` (server) | Yes (chat) |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser + middleware Supabase clients | No* |
| `SUPABASE_SERVICE_ROLE_KEY` | `src/lib/supabase/admin.ts` (leads insert, bypasses RLS) | Yes (lead capture) |
| `NEXT_PUBLIC_SITE_URL` | CORS allow-list + canonical/sitemap origin (`src/lib/seo.ts`) | Recommended |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | rate limiting (`src/lib/rate-limit.ts`) | Optional (off if unset) |
| `LEADS_WEBHOOK` | optional CRM forward in `/api/leads` | Optional |

\* **Guest-only fallback:** if the Supabase vars are blank, the app degrades to guest-only
(no login/signup, no saved history) instead of crashing. `createClient()` returns `null`,
`middleware.ts` skips session refresh, and every browser caller guards with `if (!supabase)`.
Production sets the vars in Vercel.

## Architecture

Two surfaces share one Next.js app:

1. **Chat app** at `/` — the full-viewport advisor UI (client-heavy).
2. **Marketing site** under the `(marketing)` route group — public, statically generated, SEO-optimised.

### Routing map (`src/app/`)

- `/` (`page.tsx`) — chat shell (Sidebar + ChatArea + ToolsPanel). Locks document scroll on mount via the `.chat-locked` class.
- `(auth)/login`, `(auth)/signup`, `auth/callback` — Supabase email/password auth.
- `(marketing)/` — `layout.tsx` (public header/footer + Organization/WebSite JSON-LD) wrapping: `about`, `services`, `schemes` (pillar), `calculators`, `faq`, `glossary`, `areas` (index) + `areas/[slug]` (32 SSG council guides).
- `api/anna/route.ts` — chat proxy to Anthropic (CORS → rate-limit → optional auth → proxy).
- `api/leads/route.ts` — lead capture (CORS → rate-limit → Zod → server-side `scoreLead()` → service-role insert → optional webhook).
- `sitemap.ts`, `robots.ts` — generated SEO files.
- `middleware.ts` — default-allow; refreshes the Supabase session and redirects authed users away from `/login`/`/signup`. Add explicit checks here before shipping any auth-only route.

### Chat request flow

```
Browser → src/lib/anna.ts sendToAnna() → POST /api/anna → Anthropic Messages API
```

The browser never calls Anthropic directly; the server route adds the key and caps tokens.

### Key files

- **`src/lib/anna.ts`** — system prompt (Scotland expertise), `sendToAnna()`, PDF text extraction, conversation assembly.
- **`src/lib/calculations.ts`** — pure mortgage math: repayment, LTV, LBTT bands (+ ADS), affordability, BTL yield, overpayment, remortgage break-even.
- **`src/lib/lead-scoring.ts`** (+ `.test.ts`) — pure `scoreLead()` 0–100; covered by vitest.
- **`src/lib/seo.ts`** — `SITE` config, `absoluteUrl()`, `pageMetadata()`, and JSON-LD builders (Organization, WebSite, FAQPage, Article, FinancialService/LocalBusiness, BreadcrumbList).
- **`src/lib/supabase/`** — `client.ts` (browser, returns `null` when unconfigured), `server.ts` (RSC/route handler), `admin.ts` (service-role), `auth-timeout.ts` (time-boxed `getUser`).
- **`src/lib/cors.ts`**, **`src/lib/rate-limit.ts`** — shared CORS headers + Upstash rate limiting for both API routes.
- **`src/content/`** — typed content data: `areas.ts` (32 councils, enriched), `schemes.ts`, `faq.ts`, `glossary.ts`, `services.ts`, `nav.ts`.
- **`src/components/calculators/`** — one self-contained client component per calculator. Reused by both `ToolsPanel` (chat) and `MarketingCalculators` (`/calculators` page).
- **`src/components/marketing/`** — `MarketingHeader`, `MarketingFooter`, `JsonLd`, `primitives.tsx` (Section/Breadcrumbs/PageHero/CtaBanner/Prose), `MarketingCalculators`, `FaqAccordion`.
- **`src/context/AuthContext.tsx`** — `AuthProvider` (in the root layout) exposing `{ user, loading, signOut }`; guest-safe.

### Styling / design system

- Dark theme by default: emerald/teal accent on a near-black background. Tokens are HSL CSS
  variables in `src/app/globals.css`; Tailwind maps them in `tailwind.config.js`. Inter font.
- **Viewport rule:** `globals.css` keeps the document scrollable by default; the chat route opts
  into the full-viewport lock via `.chat-locked` (added in `app/page.tsx`'s effect). Marketing
  pages scroll normally — do not re-add a global `overflow: hidden` on `html`/`body`.

## Tech Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS 3** + **shadcn/ui** (new-york, Radix primitives); `@` alias → `src/`
- **Supabase** (`@supabase/ssr`) for auth + Postgres (RLS-protected); migrations in `supabase/migrations/`
- **Framer Motion**, **React Hook Form + Zod**, **pdfjs-dist**, **Recharts**
- **Upstash Redis** for rate limiting; **Vitest** for unit tests

## Database

Schema is source-controlled in `supabase/migrations/` (`0001_baseline.sql`, `0002_leads.sql`).
Tables: `profiles` (free/pro plan), `sessions`, `messages`, `leads` — all RLS-protected
(owner-only; `leads` is insert-only for the public, readable via service role). The
`handle_new_user()` trigger auto-creates a free profile on signup.

## Deployment

Vercel, framework-detected (`vercel.json` is just `{ "framework": "nextjs" }`). Set all
required env vars in the Vercel dashboard. Security headers + CSP are defined in
`next.config.ts`.

## Conventions

- Many small, focused files; immutable updates; explicit error handling; validate at boundaries with Zod.
- API responses use the `ApiResponse<T>` envelope (`{ success, data?, error?, meta? }`).
- Keep secrets server-side only; never expose the service-role key to the client.
- LF line endings (the repo is LF; avoid editors that rewrite files to CRLF).
