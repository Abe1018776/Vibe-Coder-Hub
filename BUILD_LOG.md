# BUILD_LOG.md — YidVibe

Running record of the rebuild (Supabase + Next 15). Newest first.

## Phase 0 — Foundation ✅ (2026-05-29)
**Database (Supabase project `lqfqkivbxeexmrxuxefi`)**
- 10 tables per DATA_MODEL.md: profiles, projects, upvotes, comments, gigs,
  gig_threads, messages, competitions, competition_submissions, events.
- `projects.owner_id NOT NULL` (attributed-only v1). Added `profiles.location` +
  `profiles.available_for_hire`.
- RLS enabled + policies on every table (deny-by-default). Threads/messages locked to
  participants via `private.is_thread_participant`.
- Triggers: `handle_new_user` (auto profile on sign-in), upvote count maintainers,
  `set_updated_at`.
- Storage buckets: avatars, project-media (public), message-files (private).
- Trigram search indexes (Hebrew-friendly). **Security advisors: 0 lints.**

**App**
- Removed Clerk + Drizzle + old pages/admin/api. Switched pnpm → npm.
- `@supabase/ssr` clients (browser/server/middleware) + session-refresh middleware.
- Google sign-in: `/login`, `/auth/callback`, sign-out action. (Needs Google OAuth
  credentials pasted in Supabase dashboard to go live — code is complete.)
- BRAND theme tokens in globals.css; Fraunces + Inter + JetBrains Mono via next/font.
- App shell: sticky nav (active states, user menu, mobile menu), footer, ambient hero.
- Generated DB types → `src/lib/supabase/types.ts`.
- `tsc --noEmit` clean · `next build` green.

## Decisions
- Attributed-only v1 · Full autonomous build · Keep scaffold, rebuild pages · Images
  accept upload OR URL · **Builders and Directory are separate pages** (Builders =
  curated discovery; Directory = full searchable grid).

## Open / needs owner
- GitHub write access for `meilechwedding` (push currently 403) — required before deploy.
- Google OAuth credentials in Supabase dashboard (guided doc to come).
- yidvibe.com DNS at the end.

## Next up
- Phase 1: Profiles — profile page, edit flow, Builders, Directory.
