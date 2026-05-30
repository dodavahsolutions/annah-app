# Anna — Scotland Mortgage Guidance Tool

Anna is a Scotland-focused mortgage guidance tool web app: a Claude-powered **streaming chat
assistant** (redesigned UI under `src/components/chat/`, zustand state, light/dark),
Scotland-aware mortgage calculators (repayment, affordability, LBTT incl. ADS, LTV,
overpayment, remortgage, buy-to-let), Supabase auth + chat-history persistence, and a
public SEO/marketing site. Live at **[annahai.co.uk](https://annahai.co.uk)**.

Built with **Next.js 15 (App Router)**, React 19, TypeScript, Tailwind + shadcn/ui (marketing)
alongside a `--chat-*` token system + next-themes (chat), and Supabase.

> A fresh lead-capture flow is planned; the `/api/leads` backend + lead scoring remain in place.

> **Project status & roadmap:** see [`PROGRESS.md`](./PROGRESS.md). Architecture and
> contributor guidance live in [`CLAUDE.md`](./CLAUDE.md).

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in values (see below)
npm run dev                  # → http://localhost:3000
```

Without Supabase env vars the app still runs in **guest-only** mode (chat + calculators
work; login/signup and saved history are disabled). Chat replies require
`ANTHROPIC_API_KEY`.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server at http://localhost:3000 |
| `npm run build` | Production build (also type-checks) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (`next lint`) |
| `npm run test` / `test:run` / `test:coverage` | Vitest |

## Environment variables

See [`.env.example`](./.env.example). Summary:

- `ANTHROPIC_API_KEY` — required for chat (`/api/anna`).
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — auth + persistence (blank ⇒ guest-only).
- `SUPABASE_SERVICE_ROLE_KEY` — required for lead capture (server-side, RLS-bypassing insert).
- `NEXT_PUBLIC_SITE_URL` — CORS allow-list and canonical/sitemap origin.
- `UPSTASH_REDIS_REST_URL` / `_TOKEN` — rate limiting (optional; see below).
- `LEADS_WEBHOOK` — optional CRM forward for captured leads.

## Project layout

```
src/app/                 Routes (App Router)
  page.tsx               Chat app at /
  (auth)/                login, signup, callback
  (marketing)/           Public SEO pages: about, services, schemes,
                         calculators, faq, glossary, areas, areas/[slug]
  api/anna, api/leads    Server routes
  sitemap.ts, robots.ts  Generated SEO files
src/lib/                 anna, calculations, lead-scoring, seo, cors,
                         rate-limit, supabase/*
src/components/          calculators/*, marketing/*, lead/*, chat UI, ui/* (shadcn)
src/content/             Typed content: areas, schemes, faq, glossary, services, nav
supabase/migrations/     Source-controlled DB schema (RLS-protected)
```

## Rate limiting (`/api/anna`, `/api/leads`)

The Anthropic chat proxy at `src/app/api/anna/route.ts` is rate-limited per user
(authenticated via the Supabase session cookie) or per IP for anonymous callers.

- Authenticated: **20 requests / minute / user**
- Anonymous: **5 requests / minute / IP**
- Lead capture (`/api/leads`): **3 requests / minute / IP**

Exceeded requests return HTTP `429` with a `Retry-After` header and `X-RateLimit-*`
headers. To enable, set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (see
`.env.example`). If unset, rate limiting is skipped and a warning is logged in production.

## Deployment

Deployed on Vercel (framework auto-detected via `vercel.json`). Set all required
environment variables in the Vercel dashboard. Security headers and a Content-Security-Policy
are configured in `next.config.ts`.
