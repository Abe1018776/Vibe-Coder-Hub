# YidVibe Redesign — Design Spec

**Date:** 2026-05-31
**Status:** Approved — implementation in phases
**Owner:** Meilech (Elimelech) Moster

## Goal

Port the new visual brand defined in the owner's HTML/React prototype into the
real **Next.js 15 + Supabase** app. Keep every backend feature, server action,
query, RLS policy, and auth flow exactly as built — this is a **UI redesign**
wired to **real data**. Full site, delivered **phase by phase**, mobile-first.

The prototype (a static React-on-CDN app with sample data) is the **visual
source of truth**. Its sample projects are demo only and must NOT be treated as
real content. Reference copies of the prototype live in
[`docs/redesign-prototype/`](../../redesign-prototype/).

## Locked decisions

| Topic | Decision |
| --- | --- |
| **Heading font** | Comfortaa (replaces Fraunces) |
| **Body font** | Nunito Sans (replaces Inter) |
| **Brand mark** | New crossing-strokes + sparkle "Y" logo; sparkle motif throughout |
| **Palette** | Existing teal/gold + orange/blue/sage/clay accents (already match the prototype) |
| **Card radius** | 16px; soft shadows; airy 120px desktop sections (tighter on mobile) |
| **Motion** | Light & soft only — gentle scroll fade-rise, soft hover lifts, a calm slow hero gradient (not the busy aurora), subtle "Live" pulse. Honor `prefers-reduced-motion`. |
| **Voice** | Broader community voice — "the home for our community's builders" |
| **Mobile** | Mobile-first. App-like UX: sticky top bar + app-style **bottom tab bar** on phones for main destinations + slide-out for the rest. PWA/native deferred (app-ready, not built now). |
| **Hero search** | Working — submits to `/showcase?q=…` |
| **Category chips** | Added to the homepage in the new style → link to `/showcase?tag=…` |
| **Live counts** | Real via `getLandingStats()` — honest, may be low at launch |
| **Featured** | Real admin-only flag: new `featured` column on projects + admin toggle + gold badge |
| **Launch content** | Start clean: remove invented demo projects, **keep only genuinely-real ones** (Kehilla, Arrive, etc.). Owner confirms the keep/delete list before any deletion. Beautiful empty/low states. |
| **Scope** | Whole site **including admin**; auth + settings restyled too |
| **Publish** | Commit to owner's GitHub `origin` (branch `feat/redesign`) |

## Technical approach

- **Restyle in place + small reusable primitives.** Rewrite pages and shared
  presentational components; keep `src/lib/**`, Supabase, RLS, and the DB schema
  untouched (one additive migration for `featured`).
- **Design CSS in `globals.css`.** Tailwind v4 `@theme` tokens already match the
  brand. Add the prototype's semantic CSS variables + component classes
  (`.btn`, `.chip`, `.eyebrow`, `.project-card`, hero/section classes, motion
  keyframes) so pages reproduce the prototype faithfully and consistently. Use
  Tailwind utilities for layout.
- **Fonts** via `next/font/google` (Comfortaa, Nunito Sans).
- **Primitives:** `Container`, `Section`, `Eyebrow`, `Logo`/`LogoMark`,
  `Sparkle`; restyled button/pill/card. `AvatarCircle`, `Pill` already exist.
- **Soft motion:** a small `Reveal` wrapper (IntersectionObserver) + CSS; all
  motion disabled under reduced-motion.

## Phases (each shippable + reviewable)

0. **Design system & brand** — fonts, tokens, radius/spacing, motion utilities,
   `Logo`/`Sparkle`, `Container`/`Section`/`Eyebrow`, button/chip classes.
1. **Global chrome** — `SiteNav` (7-item + bell + Submit + avatar), `SiteFooter`,
   mobile slide-out + app-style bottom tab bar.
2. **Homepage** — hero (badge, headline, working search, CTAs, honest stats),
   category chips, persona cards ("There's a place for you here"), feature grid
   ("Everything you need"), "Fresh from the Showcase" (with empty state), CTA band.
3. **Project card** (shared) + Featured/Live badges + upvote restyle + cover
   fallback; `featured` migration + admin toggle.
4. **Showcase + Submit (ProjectForm) + Project detail + comments.**
5. **Builders + Directory + profiles (`/u/[handle]`) + settings/profile.**
6. **Gigs + Competitions + Events** (boards, post forms, detail, apply/threads).
7. **Auth (login/signup) + notifications + How-it-works (docs) + admin/reports +
   error/loading/404.**
8. **Content cleanup** (keep real only — owner-confirmed) + mobile/a11y polish +
   typecheck/build + commit.

## Out of scope (this effort)
- PWA install / native app build (designed app-ready; not implemented now).
- Backend/feature changes beyond the additive `featured` column.
- Unrelated refactors.

## Definition of done (per phase)
- `npm run typecheck` and `npm run build` pass.
- Renders with real data; empty/low states look intentional.
- Responsive from 360px up; reduced-motion respected.
- Committed to `feat/redesign`.
