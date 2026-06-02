# YidVibe UI polish batch — design (Areas A, B, C, E)

**Date:** 2026-06-02
**Status:** Approved for spec review
**Scope:** This batch covers four of the six areas agreed in the roadmap. Areas **D** (trustworthy sign-in) and **F** (full admin panel) are deferred to the next batch.

All colors below are the existing brand tokens in [globals.css](../../../src/app/globals.css): teal `--teal-600 #1f6e66` / `--teal-700 #155952` / `--teal-800 #134b45` / `--teal-50 #edf3f2`; gold `--gold-500 #e0a12e` / `--gold-700 #a9741a` / `--gold-50 #fbf3df`; sage `--sage-mid #3f8a6e`; clay `--clay-mid #c9714e`; blue `--blue-mid #4a6d8c`; orange `--orange-mid #d17f4a`; `--ink #16202b`; `--muted #5b6670`.

---

## Visual standards (non-negotiable, applies to every area)

Everything in this batch must be built from the existing brand system. No exceptions, no shortcuts.

- **Icons:** use **lucide-react** only — the same library already used across the app (`ChevronUp`, `Mail`, `Phone`, `Compass`, `Rocket`, `Briefcase`, `Trophy`, `Calendar`, `ExternalLink`, `ArrowUpRight`, `Check`, `Camera`/`Pencil`, etc.) plus the brand [`Sparkle`](../../../src/components/brand/sparkle.tsx) component. **No emojis. No ad-hoc/cheap icon glyphs.** (Any emoji shown in the brainstorm mockups was a placeholder — never ship it.)
- **Typography:** titles/numbers use `--font-display` (the brand serif); body/labels use the existing site font. Never introduce a new font.
- **Color:** only the brand tokens listed above (and their existing tints). No new/raw hex values, no off-brand grays.
- **Components:** reuse the existing brand primitives — `Panel`/`PanelLabel`, `Pill`/`TagPill`, `.btn`/`.btn-primary`/`.btn-gold`/`.btn-ghost`, `ProjectCard`, `AvatarCircle`, `EmptyState`, `FormSection`, etc. New components must match their radius, border, shadow, and spacing conventions.
- **General:** cards, buttons, inputs, and headers must be visually indistinguishable in quality from what already ships. If something can't be done the branded way, flag it rather than fall back to a cheap version.

---

## Area A — Project / site cards

### A1. Upvote button (reshape + new animation)

Rework [UpvoteButton](../../../src/components/brand/upvote-button.tsx) and the `.upvote*` rules in [globals.css](../../../src/app/globals.css#L275-L294).

- **Shape:** rounded **square**, `16px` border radius, `1.5px` border. Replaces the current vertical pill and the long full-width `.upvote-wide` bar.
- **Animation ("Snap fill, fixed"):**
  - Teal fill rises bottom→top over **~250ms** (`cubic-bezier(.3,.8,.3,1)`), not the current 600ms.
  - **Corners fill 100%:** on vote, set border-color to teal **and** background to teal (so no white slivers); fill radius matches the button's inner radius. This fixes the corner gap in the current build.
  - Arrow + count flip to white; count does a quick **pop** (`scale 1→1.4→1`, ~320ms).
  - **Gold sparkles** (`--gold-500`) fire **near-immediately** (~40–60ms), not the current 500ms delay. 5 sparks flying outward.
  - Respect `prefers-reduced-motion` (keep the existing reduced-motion fallbacks).
- **Sizes & placement:**
  - **Project cards:** small square (~52px), top-right of the title (current position, reshaped).
  - **Project detail page** ([showcase/[id]/page.tsx](../../../src/app/showcase/[id]/page.tsx#L232-L256)): **large square placed to the left of the stacked "Visit live" + "Share project" buttons, stretched to match their combined height** (`align-items: stretch`). Removes the long full-width bar.
- Remove the `upvote-wide` variant usage.

### A2. Site preview frame ("Editorial float")

Rework [MediaGallery](../../../src/components/brand/media-gallery.tsx#L64-L84).

- **Drop the browser chrome** (gray dots + cold `#eef1f3` mat).
- Screenshot **floats on a rich teal mat** — gradient `--teal-600 → --teal-800`, generous padding, `border-radius` ~18px.
- Screenshot gets a **deep soft shadow** and ~12px radius.
- A **floating URL pill** (white, ~95% opacity, teal text, small shadow) sits bottom-left with the host + a lucide `ExternalLink` (or `ArrowUpRight`) icon.
- Thumbnail strip (for multiple images) stays, restyled to sit on the teal mat.
- No-image fallback (accent gradient + initial) is unaffected.

### A3. Share popup auto-dismiss

Update [PostedShareCard](../../../src/components/brand/posted-share-card.tsx).

- Auto-dismiss after **20 seconds** via a timer that sets `open=false`.
- Add a **thin shrinking progress line** along the bottom edge (20s linear) so it's clear it will close, plus a short fade-out.
- Manual dismiss (X) and the Share action still work; clear the timer on unmount.

---

## Area B — Profile page & editor

### B1. Public profile reorganized (keep the look, fix hierarchy)

Rework [u/[handle]/page.tsx](../../../src/app/u/[handle]/page.tsx). Same aesthetic (serif names, teal, pills, soft cards) — a reorganize, not a rebuild.

- **Full-width hero header at top** so the *person* is the hero:
  - Cover band (image or `BANNER[accent]` gradient), avatar **overlapping** at bottom-left, name + verified sparkle, then `@handle · location · joined · Verified/Member` meta.
  - Actions on the right: **owner →** "Edit profile"; **visitor →** "Follow" + a discreet "···" menu (report). No "Message" button here — chat lives in Get-in-touch (B2), avoiding duplication.
- **Two columns below the hero**, aligned to the same top:
  - **Left rail (sticky):** About (bio), the compact stats strip, Tools & skills, Get in touch.
  - **Right column:** Projects — same `ProjectCard` look but presented as a clearly *supporting* section (lighter/shorter covers) so it no longer steals focus from the profile.
- Equalize panel spacing/heights so nothing looks ragged.

### B2. "Get in touch" — add internal Chat button

In the Get-in-touch panel, add a **primary teal "Chat on YidVibe"** button as the **first** option (above Email/Call/WhatsApp/etc.). It opens the internal messaging thread with this person (reuse [NoteButton](../../../src/components/messaging/note-button.tsx) → inbox). Shown to logged-in non-owners who pass `canMessage`. Not shown to the owner viewing their own profile.

### B3. Profile editor — Identity section fix

Fix the cramped/overlapping cover-image box in [profile-form.tsx](../../../src/components/profile/profile-form.tsx#L85-L108). Root cause: two wide [ImageInput](../../../src/components/brand/image-input.tsx) pickers (preview + 256px control stack each) forced side-by-side in a half-width grid.

- Replace the two side-by-side pickers with a layout that **mirrors the live hero**:
  - A **full-width cover banner** uploader (click to upload; "Change cover" affordance).
  - The **avatar circle overlapping** the cover at bottom-left, with a lucide `Camera` (or `Pencil`) affordance to change the photo.
  - **URL paste fields** for cover + avatar sit in a clean row **below** the banner (still supports paste-a-URL).
  - Name + handle fields below that.
- Implement as a small dedicated `CoverAvatarInput` (or restructured Identity block) that still writes the same hidden `cover_url` / `avatar_url` inputs the form action expects. Must stack cleanly on mobile.

---

## Area C — Dashboard & page headers

### C1. "At a glance" — bold, clickable single row

Replace the flat 8-cell `StatGrid` on the desktop dashboard ([dashboard/page.tsx](../../../src/app/dashboard/page.tsx#L52-L67)).

- **Single row of 8 tiles** (`grid-cols-8`), each a **bold solid teal tile** (gradient `--teal-600 → --teal-800`, white serif number + uppercase label).
- **Hover:** gentle **gold wash** (gradient `--gold-300 → --gold-500`, dark `--gold-900` text). **No lift, no shadow pop** — background/color transition only (~200ms).
- **Each tile is a link** to its section. Destination mapping (use the closest existing route where a dedicated one doesn't exist):
  - Upvotes → `/dashboard/posts`; Projects → `/dashboard/posts`; Followers → own profile `/u/[handle]`; Gigs → gigs (mine/closest); Competitions → competitions (mine/closest); Events → events (mine/closest); Saved → `/dashboard/saved`; Unread → `/dashboard/inbox`.
  - *(Plan step: confirm which "mine" routes exist; fall back to the public section page if not.)*
- Keep the existing mobile `DashboardHub`; this change is the desktop `lg:` overview only.

### C2. Branded page header (reusable component)

New reusable `PageHeader` component, applied on top of the main pages so every page announces where you are. Replaces the hand-rolled `h1` blocks (e.g. [showcase/page.tsx](../../../src/app/showcase/page.tsx#L61-L70)).

- **Style "Clean + accent rule":** mostly white; a **tinted accent icon chip** (accent-50 bg, accent border, accent icon), an **eyebrow** (uppercase, accent color), a **serif title**, a **subtitle**, and an optional **action slot** on the right. A **bold 2px accent-colored rule** underlines the whole header.
- **Per-section accent** prop drives icon/eyebrow/rule color: Showcase=teal, Gigs=gold, Competitions=clay, Events=sage, Directory=blue, (others as fitting). Reuse the existing `Accent` type / accent system in [lib/site](../../../src/lib/site.ts).
- Props: `eyebrow`, `title`, `subtitle`, `accent`, `icon`, `action?`.
- Apply to: Showcase, Gigs, Competitions, Events, Directory (and other top-level list/section pages). Dashboard sub-pages can adopt it incrementally.

---

## Area E — Self-serve directory listing

Builds on the existing [directory_listings](../../../src/lib/supabase/types.ts#L298) table and [createDirectoryListing](../../../src/lib/actions/directory.ts#L17). Two distinct paths:

### E1. Logged-in account-holders — self-serve, prefilled, instant

- **Entry points** (shown only when the user has **no** existing listing where `submitted_by = their id`): a prompt on **both** the user's own profile and the dashboard ("Get listed in the Directory → Add me").
- **Prefilled form** pulls from the profile:
  - `name` ← profile.name; `what_you_do` ← profile.bio; `contact` ← profile.links (email/phone/website/whatsapp); `logo_url` ← profile.avatar_url.
  - Prefilled fields carry a small "from profile" affordance (lucide `Check` + label, in sage); **Category** is the one required gap (highlighted in gold). `wants` optional.
- **Go-public toggle** ("Make my profile public too", default on): sets `profiles.is_public = true` so the listing links to a viewable profile.
- **Listed instantly:** for logged-in account-holders the listing is created with `status = 'approved'` and `submitted_by = user.id` (no admin queue). Admin retains full remove/feature control (Area F).
- The directory card links to **`/u/[handle]`** when the profile is public.

### E2. Not logged in — sign up or submit the form

- Visitors who aren't signed in **cannot** use the prefill flow. They are prompted to **sign up / log in**, or use the **existing anonymous submission form** (`createDirectoryListing` with `submitted_by = null`), which **continues to go through admin review** (`status = 'pending'`) as today.

---

## Out of scope (next batch)

- **D — Trustworthy sign-in:** fixing the raw `lqfq…supabase.co` URL on the Google consent screen (OAuth app branding + auth domain).
- **F — Full admin control panel:** all-users view, star/feature/promote, add accounts, make admin, post events/gigs/comps directly.

## Open items to resolve during planning

1. Confirm which "mine" routes exist for the At-a-glance tile destinations (gigs/competitions/events); use closest existing page otherwise.
2. Decide whether `CoverAvatarInput` is a new component or an in-place restructure of the Identity block.
3. Confirm the detail-page upvote square sizing approach (flex `align-stretch` against the stacked button column).
4. "Already listed" detection query for the directory entry-point visibility.
