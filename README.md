# YidVibe

A community marketplace for Jewish "vibe coders" — builders shipping apps and
AI tools. Showcase your work, build a profile, get hired, post gigs, run
competitions, and find community events.

## Stack

- **Framework:** Next.js 15 (App Router, React Server Components) + TypeScript
- **Backend:** Supabase (Postgres + Auth + Storage), Row Level Security on every table
- **Auth:** Google sign-in via Supabase Auth (`@supabase/ssr`)
- **UI:** Tailwind v4 + shadcn/ui, Fraunces + Inter + JetBrains Mono
- **Hosting:** Vercel

## Features

- **Showcase** — project gallery with upvotes (one per user, DB-enforced) and comments
- **Profiles** — auto portfolio per builder + curated **Builders** page + searchable **Directory**
- **Gigs** — post work, apply, and message privately (poster ↔ applicant only)
- **Competitions** — prize + deadline, submissions, pick a winner
- **Events** — community meetups

## Local dev

```bash
npm install
cp .env.example .env.local   # fill NEXT_PUBLIC_SUPABASE_URL + ANON_KEY
npm run dev                  # http://localhost:3000
```

Google sign-in setup: see **`docs/GOOGLE_OAUTH_SETUP.md`**.
Database schema lives in Supabase migrations (see `docs/superpowers/specs/`).

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint

## Deploy (Vercel)

Connected repo auto-deploys `main` to production; other branches get preview URLs.
Set env vars in the Vercel project:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL        # your production domain
```

Then set the production Site URL + redirect URLs in Supabase Auth, and add the
production origin to the Google OAuth credentials.
