# YidVibe — Build Design Spec (2026-05-29)

Source of truth for this build. The seven planning docs (CLAUDE.md, BUILD_PLAN.md,
DATA_MODEL.md, DESIGN.md, BRAND.md, COPY.md, BUILD_LOG.md) remain authoritative for
product intent + look. This spec records the **decisions, architecture, and schema deltas**
agreed with the owner on 2026-05-29.

## Product summary
Community marketplace for Jewish "vibe coders": Showcase (flagship), Builder Profiles
(flagship), Gigs, Competitions, Events. Trust = attribution. Premium, calm, mobile-first.

## Owner decisions (2026-05-29)
1. **Attributed-only for v1.** `projects.owner_id` is `NOT NULL`. No anonymous path.
   (Overrides the "allowed but lighter" wording; matches BUILD_PLAN "done" checklist.)
2. **Full autonomous build** through all 6 phases, then hand off.
3. **Keep the scaffold** (Next 15 + Tailwind v4 + shadcn `ui/` + TS config). Remove Clerk,
   Drizzle, ReactQuery, old pages, `/torah`.
4. **Images: upload OR paste-URL** (Supabase Storage + free-text URL fallback).
5. **Builders and Directory are separate pages:**
   - `/builders` — curated discovery (featured, available-for-hire, newest).
   - `/directory` — full searchable/filterable grid of every builder (skill/tool/tag + Hebrew search).
6. **Profile gains `location` (text) + `available_for_hire` (boolean)** per the owner's
   profile mockup.
7. Package manager: **pnpm**. Deploy: Vercel (push to `main` = production).

## Architecture
- **Next.js 15 App Router, React 19, TypeScript strict.**
- **Data reads:** React Server Components → server Supabase client (RLS-enforced).
- **Data writes:** Server Actions (`'use server'`) validated with Zod. Route handler only
  for `/auth/callback`.
- **Client interactivity:** minimal. `useOptimistic`/`useTransition` for the upvote button
  and message composer. No global client data cache (ReactQuery dropped).
- **Auth:** Supabase Auth, Google provider, `@supabase/ssr` cookie sessions. `middleware.ts`
  refreshes the session on each request. `/auth/callback` exchanges the code.
- **Profiles auto-create:** Postgres trigger on `auth.users` insert (`handle_new_user`),
  never app code. Handle generated from email, de-duplicated.
- **Denormalized `upvote_count`:** maintained by insert/delete triggers on `upvotes`;
  `UNIQUE(project_id,user_id)` enforces one vote per user at the DB.
- **Search (Hebrew/Yiddish + RTL):** `pg_trgm` + `ILIKE` (language-agnostic). Trigram GIN
  indexes on name/description/bio. UI chrome stays English/LTR; user content may be RTL.

## Supabase client modules
- `src/lib/supabase/client.ts` — `createBrowserClient` (client components).
- `src/lib/supabase/server.ts` — `createServerClient` with Next `cookies()` (RSC + actions).
- `src/lib/supabase/middleware.ts` — session refresh helper used by root `middleware.ts`.
- `src/lib/supabase/types.ts` — generated DB types (via `generate_typescript_types`).

## Data model (canonical SQL — see migrations)
Tables (all in `public`, all RLS-enabled, deny-by-default):
`profiles, projects, upvotes, comments, gigs, gig_threads, messages, competitions,
competition_submissions, events`. Enums: `gig_type(task|hourly|build)`,
`gig_status(open|in_progress|closed)`, `competition_status(open|judging|closed)`.

Key deltas vs DATA_MODEL.md: `projects.owner_id NOT NULL`; `profiles.location`,
`profiles.available_for_hire`; `updated_at` on profiles/projects; array columns default `{}`.

## RLS intent (deny-by-default)
- profiles/projects/upvotes/comments/gigs/competitions/submissions/events: **public read**;
  **write only own row** (`auth.uid()` = owner/author/poster/creator/user/submitter id).
- **gig_threads + messages:** readable/writable ONLY by the gig poster and the thread's
  applicant. Enforced via `is_thread_participant(thread_id, uid)` SECURITY DEFINER helper.

## Storage buckets
- `avatars` (public read; owner writes to `<uid>/…`).
- `project-media` (public read; owner writes to `<uid>/…`).
- `message-files` (private; read/write gated to thread participants via path `<thread_id>/…`).

## Routes
`/` landing · `/showcase` + `/showcase/[id]` + `/showcase/submit` · `/u/[handle]` +
`/settings/profile` · `/builders` · `/directory` · `/gigs` + `/gigs/[slug]` + `/gigs/post`
+ `/gigs/[slug]/thread/[threadId]` · `/competitions` + `/competitions/[slug]` +
`/competitions/post` · `/events` · `/login` · `/auth/callback`.

## Reusable components
`Nav`, `Footer`, `AmbientHero`, `ProjectCard`, `BuilderCard`, `GigCard`, `CompetitionCard`,
`UpvoteButton` (client, optimistic), `EmptyState`, `ImageInput` (upload|URL), `AvatarCircle`,
`TagPills`, `SearchBar`, `Pill`/`Badge` variants per BRAND accent shelf. Theme tokens from
BRAND.md in `globals.css`. Fonts via `next/font`: Fraunces (display), Inter (UI), JetBrains
Mono (tech tags).

## Quality gates ("no bugs" requirement)
`pnpm tsc --noEmit` clean · `pnpm build` passes · ESLint clean · Supabase **advisors** clean
(no RLS holes) · manual flow test (login → post → upvote → profile → gig apply) on dev server
incl. a narrow mobile viewport. TDD on pure logic (handle gen, ranking, validation).

## Needs owner action (does not block building)
- **GitHub write access** for `meilechwedding` on the repo (currently read-only → push 403).
- **Google OAuth credentials** pasted into Supabase Auth → Providers → Google (guided at
  Phase 0d). Sign-in is fully coded; only the credential paste is manual.
- **yidvibe.com DNS** at Phase 6.

## Non-goals (v1)
No anonymous content. No Torah/religious features. No separate roles/account types. No
payments. No admin dashboard.
