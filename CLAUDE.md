# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

**Anna** (project codename "ANNAH") is a Scotland-focused mortgage guidance tool web app. It
combines a Claude-powered streaming chat assistant with Scotland-aware mortgage
calculators, Supabase auth + chat-history persistence, and a public SEO/marketing site.

It is a **Next.js 15 App Router** app (not Vite — earlier revisions were Vite; that is gone).

The **chat UI at `/`** was redesigned and ported in from the (now-archived) `annah-ui`
project: a zustand-driven, streaming, light/dark chat shell living under
`src/components/chat/`. The legacy chat surface (Header/ChatArea/Sidebar/ToolsPanel) and the
old lead-capture UI have been removed; a fresh lead-capture flow will be written later (the
`/api/leads` backend + `scoreLead()` remain in place for it to build on).

> **Roadmap & status:** see `PROGRESS.md` (the source-of-truth memory file). Sprints A and B
> are done; the chat-UI port + custom-domain consolidation landed after; C–E are ahead.
> Read it before starting roadmap work.

**Canonical production URL:** `https://annahai.co.uk` (apex). `www.annahai.co.uk` and
`annah-app.vercel.app` 308-redirect to it; the archived `annah-ui.vercel.app` also redirects in.

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
| `NEXT_PUBLIC_SITE_URL` | CORS allow-list + canonical/sitemap origin (`src/lib/seo.ts`); prod = `https://annahai.co.uk` | Recommended |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | rate limiting (`src/lib/rate-limit.ts`) | Optional (off if unset) |
| `LEADS_WEBHOOK` | optional CRM forward in `/api/leads` | Optional |

\* **Guest-only fallback:** if the Supabase vars are blank, the app degrades to guest-only
(no login/signup, no saved history) instead of crashing. `createClient()` returns `null`,
`middleware.ts` skips session refresh, and every browser caller guards with `if (!supabase)`.
Production sets the vars in Vercel.

## Architecture

Two surfaces share one Next.js app:

1. **Chat app** at `/` — the full-viewport guidance UI (client-heavy).
2. **Marketing site** under the `(marketing)` route group — public, statically generated, SEO-optimised.

### Routing map (`src/app/`)

- `/` (`page.tsx`) — mounts `ChatShell` (`src/components/chat/`) wrapped in next-themes `ThemeProvider` + `TenantProvider` (scoped here so marketing stays dark-only). Locks document scroll on mount via the `.chat-locked` class.
- `(auth)/login`, `(auth)/signup`, `auth/callback` — Supabase email/password auth.
- `(marketing)/` — `layout.tsx` (public header/footer + Organization/WebSite JSON-LD) wrapping: `about`, `services`, `schemes` (pillar), `calculators`, `faq`, `glossary`, `areas` (index) + `areas/[slug]` (32 SSG council guides).
- `api/anna/route.ts` — chat proxy to Anthropic (CORS → rate-limit → optional auth → proxy).
- `api/leads/route.ts` — lead capture (CORS → rate-limit → Zod → server-side `scoreLead()` → service-role insert → optional webhook).
- `sitemap.ts`, `robots.ts` — generated SEO files.
- `middleware.ts` — default-allow; refreshes the Supabase session and redirects authed users away from `/login`/`/signup`. Add explicit checks here before shipping any auth-only route.

### Chat request flow

```
ChatShell → useSendMessage() → POST /api/anna?stream=1 → Anthropic Messages API (SSE)
         → src/lib/chat/stream.ts readStream() parses content_block_delta → zustand store
```

The browser never calls Anthropic directly; the server route adds the key, caps tokens, and
streams the Anthropic SSE through verbatim. Conversations live in the zustand store
(`src/store/useStore.ts`, localStorage-persisted); for signed-in users `useChatHistory` +
`src/lib/chat/persistence.ts` mirror them to the Supabase `sessions`/`messages` tables.

### Key files

- **`src/lib/anna.ts`** — system prompt (Scotland expertise), `sendToAnna()`, PDF text extraction, conversation assembly.
- **`src/lib/calculations.ts`** — pure mortgage math: repayment, LTV, LBTT bands (+ ADS), affordability, BTL yield, overpayment, remortgage break-even.
- **`src/lib/lead-scoring.ts`** (+ `.test.ts`) — pure `scoreLead()` 0–100; covered by vitest.
- **`src/lib/seo.ts`** — `SITE` config, `absoluteUrl()`, `pageMetadata()`, and JSON-LD builders (Organization, WebSite, FAQPage, Article, FinancialService/LocalBusiness, BreadcrumbList).
- **`src/lib/supabase/`** — `client.ts` (browser, returns `null` when unconfigured), `server.ts` (RSC/route handler), `admin.ts` (service-role), `auth-timeout.ts` (time-boxed `getUser`).
- **`src/lib/cors.ts`**, **`src/lib/rate-limit.ts`** — shared CORS headers + Upstash rate limiting for both API routes.
- **`src/content/`** — typed content data: `areas.ts` (32 councils, enriched), `schemes.ts`, `faq.ts`, `glossary.ts`, `services.ts`, `nav.ts`.
- **`src/components/chat/`** — the chat UI (`ChatShell`, `ChatArea`, `Sidebar`, `TopNav`, `InputBar`, `Message`, `MessageList`, `EmptyState`, `PromptCard`, `TypingIndicator`, `CalculatorPanel`, `SettingsPanel`, `ThemeToggle`). Self-contained; uses arbitrary-value Tailwind + `--chat-*` tokens.
- **`src/store/useStore.ts`** — zustand store (conversations, active id, generating flag, calculator/settings UI state) with localStorage persist + `hydrateConversations`/`setRemoteId`.
- **`src/hooks/useSendMessage.ts`** — send/abort + streaming + Supabase persistence + `firstName` greeting; **`useChatHistory.ts`** — loads signed-in history on mount.
- **`src/lib/chat/`** — `stream.ts` (SSE parser + `<suggestions>`), `persistence.ts` (Supabase sessions/messages), `calculations.ts`/`lbtt.ts` (chat calculator panel math), `utils.ts` (`cn`, `nanoid`).
- **`src/context/TenantContext.tsx`** + **`src/lib/tenant-config.ts`** — single-tenant config (Annah) + accent injection; mounted by the chat page only.
- **`src/components/calculators/`** — full calculator suite; reused by `MarketingCalculators` (`/calculators` page). (Chat uses its own lighter `CalculatorPanel`.)
- **`src/components/marketing/`** — `MarketingHeader`, `MarketingFooter`, `JsonLd`, `primitives.tsx` (Section/Breadcrumbs/PageHero/CtaBanner/Prose), `MarketingCalculators`, `FaqAccordion`.
- **`src/context/AuthContext.tsx`** — `AuthProvider` (root layout) exposing `{ user, loading, displayName, firstName, signOut }`; guest-safe.

### Styling / design system

**Two isolated token systems** in `src/app/globals.css` — keep them separate:
- **Marketing/shadcn:** HSL vars in `:root` (`--background`, `--accent`, `--border`, …), dark by
  default, emerald/teal accent. Tailwind maps them in `tailwind.config.js`. Inter font.
- **Chat:** `--chat-*` vars (GitHub-grays + green) with light values in `:root` and dark under
  `.dark` (toggled by next-themes). Mapped to Tailwind colors `bg-base`/`bg-surface`/
  `text-primary`/`border-chat`/`brand`/… (the chat `accent` is `brand` to avoid colliding with
  shadcn's `accent`). DM Serif Display via `--font-display`. **Never** reuse a `--chat-*` name
  for shadcn or vice-versa.
- **Viewport rule:** `globals.css` keeps the document scrollable by default; the chat route opts
  into the full-viewport lock via `.chat-locked` (added in `app/page.tsx`'s effect). Marketing
  pages scroll normally — do not re-add a global `overflow: hidden` on `html`/`body`.

## Tech Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS 3** + **shadcn/ui** (new-york, Radix primitives); `@` alias → `src/`
- **Supabase** (`@supabase/ssr`) for auth + Postgres (RLS-protected); migrations in `supabase/migrations/`
- **Framer Motion**, **React Hook Form + Zod**, **pdfjs-dist**, **Recharts**
- **Chat:** **zustand** (state), **next-themes** (light/dark), **react-markdown** + **remark-gfm**, **react-textarea-autosize**
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

**Single project/repo:** `dodavahsolutions/annah-app` → Vercel project `annah-app`,
auto-deploys `main`. Canonical domain **`annahai.co.uk`** (apex serves; `www` and
`annah-app.vercel.app` 308-redirect to apex). The old standalone `annah-ui` repo is archived
and its `annah-ui.vercel.app` 308-redirects in. If `NEXT_PUBLIC_SITE_URL` changes, redeploy —
it's a build-time `NEXT_PUBLIC_*` var baked into the sitemap/canonical output.

## Conventions

- Many small, focused files; immutable updates; explicit error handling; validate at boundaries with Zod.
- API responses use the `ApiResponse<T>` envelope (`{ success, data?, error?, meta? }`).
- Keep secrets server-side only; never expose the service-role key to the client.
- LF line endings (the repo is LF; avoid editors that rewrite files to CRLF).
