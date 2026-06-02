# YidVibe — Dashboard Consolidation, Profile/Account Rebuild & Mobile Pass

**Date:** 2026-06-01
**Branch:** `feat/redesign`
**Status:** Approved (owner picked mobile Direction C; Admin card placed near Sign out)

## Context

Third polish round after the redesign and the "Connect & Manage" round. The owner
reviewed the live dashboard and flagged five issues. Backend/data is untouched except
for setting the owner's `is_admin` flag. Desktop layout stays familiar; the bulk of the
work is route consolidation, two page rebuilds, an owner-only admin entry, a back-button
fix, and a deep mobile pass.

Verification reality (unchanged): no test runner; `next dev` is blocked by the OneDrive
symlink `EINVAL`. Gate = `npm run typecheck` + `npm run build` + `npm run lint`; visual
checks happen on the `feat/redesign` Vercel preview, not locally.

## Goals

1. Every dashboard section shares one sticky chrome — no tab "throws you out" to a standalone page.
2. Profile and Account are distinct, well-styled, and free of the avatar/banner overlap.
3. An Admin entry that appears **only for `elimelechmoster@gmail.com`**, still passcode-gated, and that works in production.
4. A genuinely premium mobile experience (Direction C hub) that mirrors desktop intent but is cleaner on a phone.
5. Back only appears when there's a real place to go back to.

## Non-goals

- No backend/schema changes beyond setting the owner's `is_admin` flag.
- No new product features. No desktop redesign — desktop keeps the sticky greeting + pill tab rail.
- Sibling detail-page restyle (gig/competition/event) stays out of scope (tracked elsewhere).

---

## Issue 1 — Tab consolidation

Today Overview / My posts / Inbox / Account live under `/dashboard` and share the layout,
but **Saved** (`/saved`) and **Profile** (`/settings/profile`) are separate routes, so they
render with no tab rail and feel like a different page.

**Change**
- New routes: `src/app/dashboard/saved/page.tsx` and `src/app/dashboard/profile/page.tsx`
  hold the real content.
- `src/app/saved/page.tsx` and `src/app/settings/profile/page.tsx` become thin `redirect()`
  stubs to the new paths (preserves bookmarks, the save-button's links, deep links).
- Update internal links to the canonical routes: `components/site/user-menu.tsx`
  (Saved, Edit profile), `components/dashboard/dashboard-tabs.tsx`, and the Account
  page manage links.
- `dashboard-tabs.tsx`: point Saved → `/dashboard/saved`, Profile → `/dashboard/profile`.
  The rail becomes **desktop-only** (`hidden lg:block`); mobile uses the hub (Issue 4).

## Issue 2 — Profile vs Account rebuild

The Account card pulls the avatar onto the cover with a negative margin (`-mt-9/-mt-11`),
which overlaps on narrow widths; the name + verified pill can collide. The Profile page
still uses the old centered "marketing" header. The two pages also overlap in purpose.

**Change — clear split**
- **Profile tab** (`/dashboard/profile`) = the edit form only. Replace the centered
  `Eyebrow`/big-heading block with a left-aligned dashboard header ("Profile" + one-line
  subtitle), then `ProfileForm` unchanged. Ensure form spacing matches dashboard panels.
- **Account tab** (`/dashboard/account`) = a settings hub:
  - Compact identity summary rebuilt **without** the avatar-over-banner overlap (inline
    avatar + name + @handle + status pill; flex-wrap safe).
  - "Who can message you" at-a-glance (links to Profile).
  - Manage links: Notification settings · View public profile · How it works.
  - **Admin** gold/shield card — **owner only**, placed **near the bottom, just above Sign out**.
  - Sign out.
  - Account no longer renders the full profile form (removes duplication with Profile tab).

## Issue 3 — Admin entry (owner-only) + production enablement

`getAdminContext()` already resolves admin via `is_admin` OR the `ADMIN_EMAILS` allowlist,
and the avatar dropdown already shows an Admin link when `isAdmin`. Gaps: it isn't surfaced
in the dashboard, and production has neither env var set.

**Change**
- Surface Admin in the dashboard for admins only:
  - Account tab gold card (near Sign out, per above).
  - Mobile hub row (Issue 4), gold accent.
  - Keep the existing avatar-dropdown Admin link.
- `/admin` stays gated: `requireAdmin()` (identity) → passcode step-up `/admin/unlock`
  (`requireAdminUnlocked`). Verify the admin landing/actions require the unlock so the
  passcode is always asked once per session. (`ADMIN_PASSCODE` already = "the one from before".)
- **Production enablement (owner-facing, called out at the end):**
  1. Set `profiles.is_admin = true` for the owner via Supabase MCP → admin recognized in
     prod with no env var needed.
  2. Set `ADMIN_PASSCODE` on Vercel (via the Vercel integration if available, else a
     one-line instruction). Optionally `ADMIN_EMAILS` too, but the `is_admin` flag covers it.

## Issue 4 — Mobile (Direction C: hub list)

**Dashboard on a phone** (`<lg`):
- `/dashboard` root = the **hub**: greeting → compact 3-stat strip (Posts · Upvotes ·
  Followers) → the quick "post" action cards → a clean vertical list of rows:
  My posts · Saved · Inbox (unread badge) · Profile · Account · **Admin** (owner only, gold).
- Each row links to its `/dashboard/*` route, which on mobile renders that section
  full-screen with a **‹ Dashboard** back arrow at the top.
- Implementation: new `components/dashboard/dashboard-hub.tsx` (`lg:hidden`) shown on the
  `/dashboard` page; the existing overview panels become `hidden lg:block`. A small client
  `components/dashboard/dashboard-mobile-bar.tsx` (reads `usePathname`, `lg:hidden`) renders
  the greeting on the hub root and the "‹ Dashboard" back link on sub-pages. The pill rail
  is `hidden lg:block`. Layout fetches `getAdminContext()` to pass `isAdmin` down.

**Global bottom bar** (`components/site/mobile-bottom-nav.tsx`): recompose the 5 slots to
**Home (`/`) · Explore (boards sheet) · ＋ (post menu) · Inbox (`/dashboard/inbox`) · You
(avatar → `/dashboard`)**. "Explore" opens the existing all-boards sheet (Showcase, Builders,
Directory, Gigs, Competitions, Events, Docs). Signed-out: Inbox/You fall back to `/login`.
This fixes today's missing Home/Dashboard access and the cramped board-only bar.

**Deep pass:** review spacing, tap-target sizes (≥44px), safe-area insets, and clutter on
the dashboard hub, the section sub-pages, Profile form, Account, and the key list pages, at
real phone widths (360–414px). Desktop unaffected (`lg:` breakpoints only).

## Issue 5 — Back button

`ContextBar` already hides Back on top-level roots and everything under `/dashboard`, but
`BackLink` falls back to a guessed section root even when that isn't sensible.

**Change**
- `BackLink`: when there is no safe in-app history **and** no explicit `fallbackHref`, render
  nothing. Gate on a mounted flag so the server render doesn't flash a button that then
  disappears (no hydration flicker).
- `ContextBar`: remove `/saved` from `NO_BACK` (it moves under `/dashboard`, already excluded);
  keep the `/settings/*` → `/dashboard` fallback for the redirect stubs. Confirm no
  top-level route still shows a stray Back.

## Extras (found during exploration)

- Avatar-menu (`user-menu.tsx`) links updated to the new canonical dashboard routes.
- Bottom bar gains Home + dashboard access (above).
- Pill rail no longer horizontally crammed on phones (replaced by the hub on mobile).

## Verification

- `npm run typecheck` + `npm run build` + `npm run lint` all green (after `rm -rf .next`
  if the OneDrive `.next/diagnostics EINVAL` flake hits).
- Push `feat/redesign`; owner eyeballs the Vercel branch preview on desktop **and** a phone:
  tab consolidation (no standalone jumps), Profile/Account styling + no overlap, Admin
  visible only for the owner and passcode-gated, mobile hub + back arrows, recomposed bottom
  bar, and Back hidden where there's nowhere to go.

## Rollout

Per established workflow: commit per section on `feat/redesign` → push → branch preview →
merge to `main` for production once the owner approves. Set the owner `is_admin` flag +
`ADMIN_PASSCODE` on Vercel as the final production-enablement step.
