# BUILD_LOG.md — YidVibe

Running record of the rebuild (Next 15 + Supabase). Newest first.

## Status: v1 feature-complete (local) — 2026-05-29
All six phases built, type-checked, production-built, and runtime-verified with
seeded data (then cleaned). Supabase security advisors: **0 lints**.

### Phases
- **Phase 0 — Foundation:** 10-table schema, RLS on every table (deny-by-default),
  triggers (profile auto-create, upvote counter, updated_at), 3 storage buckets,
  trigram search. `@supabase/ssr` clients + session middleware. Google auth
  (login/callback/sign-out). BRAND theme tokens + Fraunces/Inter/JetBrains fonts.
  Sticky nav + footer + ambient hero. (pnpm → npm.)
- **Phase 1 — Profiles:** `/u/[handle]` (header + auto project gallery), edit flow
  `/settings/profile`, `/builders` (curated), `/directory` (search + tool/skill/
  available filters, Hebrew/RTL input). Shared cards: ProjectCard (optimistic
  upvote), BuilderCard, Pill, EmptyState, AvatarCircle, ImageInput (upload or URL).
- **Phase 2 — Showcase:** grid (search + tool/tag filters + Top/New + top-ranked
  highlight), submit + edit (ProjectForm), detail (media, upvote, builder bond,
  comments), project + comment CRUD.
- **Phase 3 — Landing:** hero + ambient drift, live stat counters, two-door split,
  feature cards, live showcase strip, closing CTA.
- **Phase 4 — Gigs:** board, post form (task/hourly/build), public detail with Apply,
  poster applicant list + status controls, **private RLS-locked message threads**.
- **Phase 5 — Competitions:** grid (prize/deadline/entry count), post, detail with
  submit-entry, entries gallery, creator pick-winner (golden badge).
- **Phase 6 — Events + polish:** Luma-style upcoming list + add-event; global
  loading skeleton + error boundary; empty states throughout.

### Verified
- Profile auto-create trigger; upvote-count trigger; embedded owner/creator joins;
  comments; competition entry counts; private-thread helper (poster + applicant
  see it, stranger does not). All pages render real content; redirects + 404 work.

### Decisions
Attributed-only v1 · Keep scaffold, rebuild pages · Images upload OR URL ·
Builders (curated) and Directory (search) are separate · pnpm → npm.

## Remaining (owner action — not code)
1. **GitHub write access** for `meilechwedding` (push currently 403) — needed to push/deploy.
2. **Google OAuth** — follow `docs/GOOGLE_OAUTH_SETUP.md` (5 min) to make sign-in live.
3. **Deploy** to Vercel (set the 2 NEXT_PUBLIC env vars) + connect yidvibe.com DNS.

## Safety
Old build preserved at branch `backup/old-build`, tag `old-build-snapshot-2026-05-29`,
and `legacy-monorepo`. New build committed on `main` (local; not yet pushed).
