# YidVibe — Phase 2: "Connect & Manage" — Design Spec

**Date:** 2026-06-01
**Branch:** `feat/redesign`
**Status:** Approved in brainstorming; ready for implementation planning.

## Overview

A feature + polish round that turns YidVibe from a directory you browse into a
place you live in. Five product ideas plus a visual-quality pass, all sharing one
consistent design system.

Builds on the existing Next 15 + Supabase app. Reuses existing primitives
(`ShareButton`, `AvatarCircle`, `DetailHero`, gig-thread conversation pattern,
notifications, `/docs`). Mobile keeps its current bottom-tab chrome; the big
chrome change is desktop-only.

## Standing rules (apply to every section)

1. **One consistent style site-wide.** Every page uses the same card system
   (border `--border`, radius, soft shadow, padding), pills, buttons, section
   labels, the desktop sidebar + context-bar chrome, and the branded back link.
   Extract shared primitives so pages can't drift: `PageHeader`, `Panel`,
   `StatGrid`, `ActionCard`, plus the existing `.btn`/`.chip` classes.
2. **No emoji in UI.** Use the existing premium line icons (Lucide) everywhere.
3. **Document every feature in How It Works.** Each feature below ships with a
   written section in `/docs` (and the dashboard "How it works" tab renders the
   same content). This is a required deliverable per phase, not an afterthought.

---

## Section A — App shell: desktop side nav + context bar (idea #4 + #1)

Chosen layout: **C — sidebar + slim context bar.**

- **Desktop (lg and up):** a persistent **left sidebar** containing the logo,
  vertical primary nav (Home, Showcase, Gigs, Competitions, Events, Directory,
  Builders), a gold **Submit** button, the notifications bell, and the user
  **avatar pinned at the bottom that links to `/dashboard`**.
- The content area gains a **slim context bar** holding the branded **← Back**
  link, the page title slot, and contextual actions (share, etc.).
- **Tablet and mobile (below lg):** unchanged — current top logo bar + bottom tab
  bar (`mobile-bottom-nav.tsx`) stay exactly as they are. **Default: the sidebar
  appears only at lg+; tablet uses the mobile chrome.**

New components: `site/sidebar.tsx`, `site/context-bar.tsx`, `brand/back-link.tsx`.
`app/layout.tsx` becomes a flex shell (sidebar + main) at lg. `site-nav.tsx` is
refactored to render the sidebar on desktop and the existing top bar on
mobile — not discarded.

## Section B — Back / Cancel on forms (idea #1)

- Every post/edit form (project submit + edit, gig, competition, event, profile
  edit) gets a **Cancel** action that returns to the **previous page**
  (`router.back()` with a safe fallback to that content's board when there is no
  history).
- The branded **← Back** link (Section A) appears on every inner/detail page —
  in the context bar on desktop, at the top of the page on mobile.
- A `useUnsavedChanges` hook plus a branded **"Discard your draft?"** confirm
  dialog fires only when the form is dirty and the user cancels or navigates away.

## Section C — Sharing (idea #2)

- Extend `ShareButton` with an **editable, pre-filled caption**
  (e.g. "Check out my project '{title}' on YidVibe →"). Uses the native share
  sheet's `text` + `url`; falls back to copy-link with a toast. **Branded icons,
  no emoji.**
- A **"Posted! Share it"** card on the success screen immediately after a user
  posts a project/gig/competition/event.
- **Rich link previews:** per-post Open Graph tags + a **dynamic OG image**
  (`opengraph-image.tsx` via `next/og` `ImageResponse`) rendering the post's
  image/title/builder in brand style, so shared links look premium in
  WhatsApp / X / group chats.

## Section D — Private replies (idea #3 + the Inbox)

Lightweight private notes — **not** a chat app. A two-way thread for messages
like "nice work", "let's collaborate", "can I call you?".

**Data model (new; gig threads untouched):**

- `conversations`: `id`, `participant_a` (uuid), `participant_b` (uuid),
  `about_type` (text, nullable: 'project' | 'gig' | …), `about_id` (uuid,
  nullable), `created_at`, `last_message_at`. Unique on the ordered participant
  pair (one conversation per pair). RLS: only the two participants can select.
- `conversation_messages`: `id`, `conversation_id`, `sender_id`, `body` (text),
  `created_at`, `read_at` (nullable). RLS: participants only; sender must be a
  participant.
- `profiles.dm_privacy` enum: **`everyone` (default)** | `followers` | `none`.

**Entry points:**

- "Send a private note" button on a profile.
- Clicking the **"Available for hire" badge (and other intent badges)** on a
  profile starts a note to that builder.
- "Reply privately" on a project/gig/competition detail page → opens or creates a
  conversation carrying `about_type`/`about_id` ("re: {post}").

**Behavior:**

- **Free text**, light **two-way thread**; UI mirrors the existing gig-thread
  screen (`gigs/[slug]/thread/[threadId]`).
- **Gating:** a server check enforces `dm_privacy` + follow relationship. When
  blocked (target set to `followers` and sender isn't a follower, or `none`), the
  send button / badge shows a polite "not accepting notes right now" message
  instead of an input.
- **Inbox** lives in the Dashboard (Section E). New **"private reply"
  notification type** wired into the bell + `notification_prefs`.

## Section E — Dashboard (idea #5)

New route group `app/dashboard/`, reached by the sidebar avatar / user menu.
**Top-tab navigation** (no second sidebar):

`Overview · My posts · Saved · Inbox · Profile & skills · Account · Notifications · How it works`

- **Overview** = the user's complete public snapshot:
  - A **full stats grid**: projects, upvotes received, gigs, competitions,
    events, saved, followers, replies.
  - A hero **"Post something"** row of four **big branded cards** —
    Project (teal), Gig (gold), Competition (clay), Event (sage) — each with a
    premium icon, title, and one-line description.
  - **Recent activity** (upvotes, gig applications, events going to, saves).
  - **Private replies** preview (newest notes → Inbox).
- **My posts** — everything the user has posted, grouped by type, each with a
  share action.
- **Saved**, **Notifications**, **Profile & skills**, **Account** **reuse the
  existing pages' logic** so there is one source of truth (Saved ↔ `/saved`,
  Notifications ↔ settings, Profile & skills ↔ `/settings/profile`, Account =
  account info + sign out). **How it works** renders the same content as `/docs`.
- **Default:** `/saved` and `/notifications` keep their standalone URLs *and*
  appear as Dashboard tabs (same content, two doors).
- The sidebar avatar and `user-menu.tsx` now point to `/dashboard`.

## Section F — Site-wide consistency (cross-cutting)

- Extract and apply shared primitives (`PageHeader`, `Panel`, `StatGrid`,
  `ActionCard`, pills, buttons) so every page looks like one product.
- Apply the Section A chrome (sidebar + context bar + back link) to all pages.
- Premium line icons only, no emoji.
- Each feature documented in `/docs` as it ships (standing rule #3).

## Section G — Visual quality pass

### Profile header
Replace the current overlapping banner+avatar (where the banner gradient and the
avatar fill share the same accent and blend together) with **Option B — the inline
header card**: a slim brand strip, the avatar **inline beside** the name/handle,
actions (Edit / Follow / Note) top-right, stats in a clean row below. No overlap,
can't break, matches the card system.

### Project detail page (full rebuild — current code is a narrow `max-w-3xl`
single column; rebuild to the approved layout)

- **Full-width header**: project icon, title, **Live/Featured badge**, a one-line
  **tagline**, and "by {builder} · posted {date}" — so the two columns below
  **start at the same height**.
- **Two aligned columns** (`align-items:start`), wider container than today:
  - **Left:** **screenshot-led media gallery** → **About** → **Looking for**
    (commercial-intent badges, when set).
  - **Right sticky rail:** **Actions** card (big Upvote, Visit live, Watch demo,
    Share) → **Built by** card → **Details** card (Built with, Topics, Posted
    date, Status) → **Comments** card.
- **Screenshot-led media:** because projects are software/screens, the uploaded
  screenshot is the star — shown large in a soft **browser-style frame** on a
  soft **mat** using **`object-contain` (never badly cropped)**, so any aspect
  ratio (wide, square, tall) looks intentional. A **thumbnail strip** handles
  multiple images (gallery up to 5). The gradient `DetailHero` remains **only as
  the no-image fallback**.
- **Comments:** moved **into the right rail, under Details**, as a **fixed-height
  card that scrolls internally** (comment list + input inside it) rather than a
  wide full-column section. Stacks full-width on mobile.
- **Every project field has a home:** title, tagline, Live/Featured, screenshots,
  description, live link, demo video, built-with tools, topic tags, commercial
  intent, builder, posted date, upvotes, comments.

### Framing, motion, spacing
- **Soft framed cards** throughout (consistent border, radius, soft shadow,
  padding); warm canvas behind so cards read as "finished."
- **Snappier motion:** `yv-reveal` 0.6s → ~0.4s with a tighter curve, applied
  consistently (`globals.css`).
- Consistent spacing rhythm and uppercase section labels everywhere.

### Apply the system to siblings
The same detail-page system (header + media + sticky rail + cards) carries to the
**gig / competition / event** detail pages so the whole site matches.

---

## Suggested build order (each phase is independently shippable)

1. **App shell & navigation** — desktop sidebar + context bar + branded back link
   + form Cancel + unsaved-changes guard. Foundation everything sits on.
2. **Visual quality pass (Section G)** — shared primitives + motion + profile
   header + project/gig/competition/event detail pages. Biggest visible win.
3. **Dashboard** — scaffold + Overview + tabbed sections reusing existing pages.
4. **Private replies** — DB (conversations + messages + `dm_privacy`) → entry
   points → inbox → notification type.
5. **Sharing upgrades** — caption + post-success moment + per-post OG images.
6. **Consistency sweep + How-It-Works writeups + mobile/a11y polish.**

Each phase ends with its `/docs` "How it works" writeup and a Vercel branch-preview
check (local `next dev` is blocked by the OneDrive symlink issue; verify on the
`feat/redesign` preview URL).

## Defaults to confirm at review

- Tablet uses the **mobile chrome** (sidebar at lg+ only). ✔ assumed.
- `/saved` and `/notifications` keep standalone URLs **and** appear as Dashboard
  tabs. ✔ assumed.

## Out of scope (YAGNI)

- Real-time chat / typing indicators / attachments in private replies (it stays a
  simple note thread).
- Canned quick-reply chips (explicitly dropped — free text only).
- Group conversations.
- Email/push notifications (in-app only, as today).
