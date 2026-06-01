# Connect & Manage — Implementation Plan

> **For agentic workers:** Execute phase-by-phase. Steps use checkbox (`- [ ]`) syntax.
> **Verification note:** This repo has no unit-test runner (scripts: dev/build/start/lint/typecheck). Each task is verified with `npm run typecheck` then `npm run lint`, and each phase ends with a full `npm run build`. Local `next dev` is broken by the OneDrive symlink issue — do NOT rely on it. Visual verification happens on the `feat/redesign` Vercel branch preview. Commit per task, push per phase.

**Goal:** Ship the "Connect & Manage" round — desktop side-nav + context bar, back/cancel UX, a dashboard hub, private replies, richer sharing, and a site-wide visual-quality pass — onto `feat/redesign`.

**Architecture:** Next 15 App Router + Supabase. Add a desktop sidebar shell at `lg+` while keeping the mobile bottom-nav untouched. Extract shared layout primitives so every page matches. New `conversations`/`conversation_messages` tables for private replies. Rebuild the project detail page screenshot-first with a sticky info rail.

**Tech Stack:** Next 15, React 19, Tailwind v4, Radix UI, lucide-react, sonner, Supabase (ssr), zod + react-hook-form.

**Spec:** `docs/superpowers/specs/2026-06-01-yidvibe-connect-and-manage-design.md`

---

## Conventions (apply throughout)

- **No emoji in UI.** Use lucide-react icons only.
- **One card system:** reuse `.project-card`-style soft cards — `rounded-2xl border border-border bg-surface shadow-[var(--shadow-sm)]`. Extract to a `Panel` primitive (Phase 2) and use everywhere.
- **Commit message style:** `Phase N §X: <what>` to match existing history.
- **Staging:** only `git add` explicit paths (the `.superpowers/` scratch is untracked and must never be committed).
- **Push:** end of each phase, `git push origin feat/redesign`, then sanity-check the build succeeded.

---

## Phase 1 — App shell: desktop sidebar + context bar + back link + form cancel

**Outcome:** Desktop (`lg+`) gets a left sidebar + slim context bar with a branded Back link; mobile unchanged. All post/edit forms get Cancel + an unsaved-changes guard.

**Files:**
- Create: `src/components/site/sidebar.tsx` — desktop left nav (logo, vertical `NAV_LINKS`, gold Submit, `NotificationBell`, bottom avatar → `/dashboard`).
- Create: `src/components/site/context-bar.tsx` — sticky slim bar: `BackLink` + optional title slot + right-side action slot. Client component (uses pathname to hide on home).
- Create: `src/components/brand/back-link.tsx` — `"use client"`; renders a branded `← Back`; `router.back()` with fallback to a `fallbackHref` prop when `history.length <= 1`.
- Create: `src/components/brand/cancel-button.tsx` — `"use client"`; Cancel that calls `router.back()`/fallback, guarded by the unsaved hook.
- Create: `src/hooks/use-unsaved-changes.ts` — tracks a `dirty` boolean; `beforeunload` listener; exposes `confirmDiscard()` using a Radix AlertDialog (create `src/components/brand/confirm-dialog.tsx`).
- Create: `src/components/brand/confirm-dialog.tsx` — Radix `@radix-ui/react-dialog` "Discard your draft?" confirm.
- Modify: `src/app/layout.tsx` — wrap children in a flex shell: `<Sidebar/>` (`hidden lg:flex`) + `<main class="lg:pl-[260px]">`; keep `<SiteNav/>` top bar for `< lg` and `<MobileBottomNav/>`.
- Modify: `src/components/site/site-nav.tsx` — render top bar only `lg:hidden` (mobile), since desktop nav moves to the sidebar. Keep notification + user menu in mobile bar.
- Modify each form page to add `<CancelButton>` + wire dirty state:
  `src/app/showcase/submit/page.tsx`, `src/app/showcase/[id]/edit/page.tsx`, `src/app/gigs/post/page.tsx`, `src/app/competitions/post/page.tsx`, `src/app/events/post/page.tsx`, `src/app/settings/profile/page.tsx` (and the underlying form client components they render).
- Modify detail/inner pages to drop their ad-hoc back links in favor of the context bar `BackLink` (project/gig/competition/event/profile). Keep one Back source of truth.

**Tasks:**
- [ ] Build `BackLink` + `CancelButton` + `useUnsavedChanges` + `ConfirmDialog`; `npm run typecheck`.
- [ ] Build `Sidebar` (desktop) using existing `NAV_LINKS`, `Logo`, `NotificationBell`, `AvatarCircle`; active-link styling like `nav-links.tsx`. `npm run typecheck`.
- [ ] Build `ContextBar`; integrate `BackLink`. `npm run typecheck`.
- [ ] Rewire `app/layout.tsx` shell + make `site-nav.tsx` mobile-only. Verify mobile bottom nav + `pb-16 lg:pb-0` still correct. `npm run build`.
- [ ] Add `CancelButton` + dirty-guard to all 6 forms. `npm run typecheck`.
- [ ] Replace ad-hoc back links on detail pages with context-bar Back. `npm run build` + `npm run lint`.
- [ ] `/docs` "How it works": add **Navigating YidVibe** section (sidebar, back, cancel). 
- [ ] Commit per task; `git push origin feat/redesign`.

---

## Phase 2 — Visual quality pass (Section G)

**Outcome:** Shared primitives extracted; snappier motion; profile header rebuilt (no overlap); project detail page rebuilt screenshot-first with sticky rail + scrollable comments; same system applied to gig/competition/event detail pages.

**Files:**
- Create: `src/components/brand/panel.tsx` — `Panel` (soft card) + `PanelLabel` (uppercase section label).
- Create: `src/components/brand/stat-grid.tsx` — `StatGrid`/`Stat` (reuse the `Stat` from profile page).
- Create: `src/components/brand/action-card.tsx` — the big branded "post something" card (icon, title, subtitle, accent border-top) for dashboard + reuse.
- Create: `src/components/brand/media-gallery.tsx` — `"use client"`; primary image in a browser-style frame on a soft mat (`object-contain`), thumbnail strip, switches active image. No-image → render `DetailHero` gradient fallback.
- Create: `src/components/showcase/comments-card.tsx` — fixed-height, internally scrollable comments list + `AddCommentForm`, used in the rail.
- Modify: `src/app/globals.css` — `.yv-reveal.in` animation `0.6s` → `0.4s`; verify reduced-motion block still disables it.
- Modify: `src/app/u/[handle]/page.tsx` — replace banner+overlap header with the inline header card (slim brand strip, avatar inline beside name, actions top-right, stats row). Keep contact links + projects grid.
- Modify: `src/app/showcase/[id]/page.tsx` — rebuild to: full-width header (icon, title, Live/Featured badge, tagline=first line/short desc, by·date) + two columns (`align-items:start`, wider container e.g. `max-w-6xl`): left = `MediaGallery` → About `Panel` → Looking-for `Panel`; right sticky rail = Actions `Panel` (Upvote, Visit live, Watch demo, Share) → Built-by `Panel` → Details `Panel` → `CommentsCard`.
- Modify: `src/app/gigs/[slug]/page.tsx`, `src/app/competitions/[slug]/page.tsx`, `src/app/events/*` detail — adopt the same header + two-column + Panel system (rail content per type).

**Tasks:**
- [ ] Extract `Panel`/`PanelLabel`/`StatGrid`/`ActionCard`; `npm run typecheck`.
- [ ] Motion tweak in `globals.css`; `npm run build`.
- [ ] Rebuild profile header (Option B); `npm run build`.
- [ ] Build `MediaGallery` + `CommentsCard`; `npm run typecheck`.
- [ ] Rebuild project detail page two-column; ensure mobile stacks (rail below, comments full-width). `npm run build`.
- [ ] Apply system to gig/competition/event detail pages; `npm run build` + `npm run lint`.
- [ ] `/docs`: add **A guided tour of a project page** section.
- [ ] Commit per task; push.

---

## Phase 3 — Dashboard hub

**Outcome:** `/dashboard` with top tabs; Overview = full stats + big post cards + recent activity + replies preview; other tabs reuse existing pages.

**Files:**
- Create: `src/app/dashboard/layout.tsx` — auth-gate (redirect to `/login?next=/dashboard` if no profile); render `DashboardTabs` + children.
- Create: `src/components/dashboard/dashboard-tabs.tsx` — `"use client"`; pill tab-row routing to `/dashboard`, `/dashboard/posts`, `/saved`, `/dashboard/inbox`, `/settings/profile`, `/dashboard/account`, `/settings/notifications`, `/docs` (or internal sections — see below).
- Create: `src/app/dashboard/page.tsx` — Overview: `StatGrid` (projects, upvotes, gigs, competitions, events, saved, followers, replies via a new `getDashboardStats`), four `ActionCard`s, recent activity, replies preview.
- Create: `src/app/dashboard/posts/page.tsx` — user's posts grouped by type, each with `ShareButton`.
- Create: `src/app/dashboard/account/page.tsx` — account info (email, handle, joined) + sign out.
- Create: `src/app/dashboard/inbox/page.tsx` + `src/app/dashboard/inbox/[conversationId]/page.tsx` — built in Phase 4 (stub now: "No messages yet").
- Create: `src/lib/queries/dashboard.ts` — `getDashboardStats(profileId)`, `getRecentActivity(profileId)`.
- Modify: `src/components/site/user-menu.tsx` + `Sidebar` avatar → link to `/dashboard`.

**Tasks:**
- [ ] `getDashboardStats` + `getRecentActivity` queries; `npm run typecheck`.
- [ ] Dashboard layout + tabs (auth-gated); `npm run typecheck`.
- [ ] Overview page (stats + ActionCards + activity + replies-preview stub); `npm run build`.
- [ ] My posts + Account pages; inbox stub; `npm run build`.
- [ ] Point avatar/user-menu to `/dashboard`; `npm run lint`.
- [ ] `/docs`: add **Your dashboard** section.
- [ ] Commit per task; push.

---

## Phase 4 — Private replies

**Outcome:** `conversations` + `conversation_messages` tables, `dm_privacy`, entry points (profile, available-for-hire badge, post "reply privately"), two-way free-text threads in the dashboard inbox, notification type.

**Files:**
- Create migration: `supabase/migrations/20260601120000_private_conversations.sql` — tables + RLS + `profiles.dm_privacy` enum (`everyone`|`followers`|`none`, default `everyone`) + `last_message_at` trigger + notification trigger (`type = 'private_reply'`) modeled on `20260529130000`.
- Apply via Supabase MCP `apply_migration`; then regenerate `src/lib/supabase/types.ts` (`generate_typescript_types`).
- Create: `src/lib/conversations.ts` — `getOrCreateConversation(otherId, about?)`, `getMyConversations()`, `getConversation(id)`, `sendMessage(conversationId, body)`, `canMessage(targetProfile)` (enforces `dm_privacy` + follow).
- Create: `src/lib/actions/conversations.ts` — server actions: `startConversation`, `postMessage`.
- Create: `src/components/messaging/note-button.tsx` — "Send a private note" (handles blocked state with a polite message).
- Create: `src/components/messaging/conversation-thread.tsx` — message list + composer (reuse gig-thread styling).
- Modify: `src/app/dashboard/inbox/page.tsx` + `[conversationId]/page.tsx` — real inbox list + thread.
- Modify: `src/app/u/[handle]/page.tsx` — `NoteButton`; make the available-for-hire / intent pills act as note CTAs.
- Modify: `src/app/showcase/[id]/page.tsx` (+ gig/competition detail) — "Reply privately" in the Built-by/Actions panel (carries `about`).
- Modify: `src/lib/notifications.ts` — `describeNotification` handles `private_reply`.
- Modify: `src/settings/profile` form — add `dm_privacy` select.

**Tasks:**
- [ ] Write migration; `apply_migration`; `get_advisors` (security) clean; regenerate types. 
- [ ] `conversations.ts` lib + actions; `npm run typecheck`.
- [ ] `NoteButton` + gating; wire to profile + badges; `npm run build`.
- [ ] `ConversationThread` + inbox list/thread pages; `npm run build`.
- [ ] "Reply privately" on detail pages (with `about`); notification describe + settings select; `npm run build` + `npm run lint`.
- [ ] `/docs`: add **Private notes** section (incl. privacy settings).
- [ ] Commit per task; push.

---

## Phase 5 — Sharing upgrades

**Outcome:** Editable pre-filled caption, "Posted! Share it" success moment, per-post Open Graph images.

**Files:**
- Modify: `src/components/brand/share-button.tsx` — accept `caption` prop; native share `text` + copy includes caption; editable variant (small popover) where used as the primary share.
- Create: `src/components/brand/posted-share-card.tsx` — success card (branded icons) shown after posting.
- Modify: submit/post success flows (project/gig/competition/event) to render `PostedShareCard` (e.g., redirect to detail with `?posted=1`, or inline success state).
- Create OG image routes: `src/app/showcase/[id]/opengraph-image.tsx` (and gig/competition) using `next/og` `ImageResponse` — brand background, title, builder, image. Add `twitter-image` re-export.
- Modify: `generateMetadata` on detail pages to ensure `openGraph`/`twitter` metadata reference the dynamic image.

**Tasks:**
- [ ] Extend `ShareButton` with caption; `npm run typecheck`.
- [ ] `PostedShareCard` + wire into post success; `npm run build`.
- [ ] OG image route for projects; verify it renders in build; add gig/competition. `npm run build`.
- [ ] Metadata wiring; `npm run lint`.
- [ ] `/docs`: add **Sharing your work** section.
- [ ] Commit per task; push.

---

## Phase 6 — Consistency sweep + docs + polish

**Outcome:** Every remaining page adopts the Panel/header/back system; How-It-Works complete; mobile/a11y polish.

**Tasks:**
- [ ] Audit each route page; swap ad-hoc cards for `Panel`, ensure context-bar Back present, spacing rhythm consistent. `npm run build` after each cluster.
- [ ] Verify mobile (`< lg`): sidebar hidden, bottom nav intact, comments/rail stack correctly, no horizontal scroll.
- [ ] a11y: focus-visible rings, `aria-label`s on icon buttons, dialog labels.
- [ ] `/docs`: final pass so every feature in this round is documented.
- [ ] Full `npm run build` + `npm run typecheck` + `npm run lint` green.
- [ ] Commit; push; write a summary of what shipped + what needs a visual review.

---

## Self-review (spec coverage)

- Idea #1 back/cancel → Phase 1. ✔
- Idea #2 share (caption, post-moment, OG) → Phase 5. ✔
- Idea #3 private replies (+ badge CTA, privacy levels, inbox) → Phase 4. ✔
- Idea #4 desktop side nav → Phase 1. ✔
- Idea #5 dashboard (tabs, overview stats, post cards, how-it-works) → Phase 3. ✔
- Section F consistency + no-emoji + document-in-How-It-Works → Phases 2 & 6 + per-phase docs task. ✔
- Section G visual pass (profile header, project page rebuild, screenshot-led media, scrollable comments, motion, siblings) → Phase 2. ✔
- Defaults: tablet=mobile chrome (Phase 1 `lg+` gate); saved/notifications dual-door (Phase 3 tabs link to existing routes). ✔
