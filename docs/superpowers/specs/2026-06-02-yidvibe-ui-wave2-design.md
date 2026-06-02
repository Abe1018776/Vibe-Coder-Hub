# YidVibe UI Wave 2 — design (groups 1–5 + help links)

**Date:** 2026-06-02
**Status:** Approved for spec review
**Scope:** The visible-UI wave. Out of scope this round: **F** (full admin panel — only the tag-manager slice is here) and **D** (trustworthy sign-in — a guided config task). Group 6 (full How-it-works/FAQ rewrite) is also deferred; this wave only adds contextual help links pointing at the existing `/docs`.

**Brand rules (non-negotiable, same as Wave 1):** lucide-react icons only — **no emojis**; `--font-display` serif for titles/numbers; only brand color tokens (`--teal-*`, `--gold-*`, `--sage-*`, `--clay-*`, `--blue-*`, `--orange-*`, `--ink`, `--muted`) and their tints; reuse brand primitives (`Panel`, `Pill`, `.btn*`, `ProjectCard`, `BuilderCard`, `AvatarCircle`, `Container`, `PageHeader`). Any emoji shown in the brainstorm mockups was a placeholder. See [[brand-fidelity-no-cheap-ui]].

---

## Group 1 — Quick fixes

### 1A. Showcase cards: equal height + more breathing room
- Project cards in a grid row must be **equal height**. On the landing page they're wrapped in `<Reveal>` which becomes the grid cell and doesn't stretch — make the `ProjectCard` (or its wrapper) `h-full` so cards fill the cell. Apply wherever cards render in a grid (`/showcase`, landing "Top Projects", profile projects).
- Add **breathing room**: increase grid `gap` (e.g. `gap-5` → `gap-6`) and the card body padding slightly so cards feel less squashed. Keep it subtle and on-brand.

### 1B. Profile editor avatar cut-off
- In [cover-avatar-input.tsx](../../../src/components/profile/cover-avatar-input.tsx), the overlapping avatar (`-bottom-8`) is **clipped** because it sits inside the cover's `overflow-hidden` container. Restructure so the avatar is NOT clipped: put `overflow-hidden` only on the **cover image div**, and make the avatar a sibling positioned over it within a non-clipping `relative` wrapper (add bottom padding to the wrapper to make room for the overhang). The avatar must render fully (no cut-off) on desktop and mobile.

### 1C. Site preview frame restyle ("Soft inset")
Rework [media-gallery.tsx](../../../src/components/brand/media-gallery.tsx) (currently the teal "editorial float"):
- **Drop the teal mat and the floating URL pill entirely** (the detail page's "Visit live" button already covers the link).
- New frame = **soft inset**: outer card with a slim neutral mat (`~8px` padding, light gray e.g. `bg-secondary`/`#f7f8f9`), `1px` border, soft shadow, rounded (`~16px`). The screenshot sits inside with a **super-thin teal hairline border** (`1px solid var(--teal-600)` — or a very low-opacity teal) and `~10px` radius, separating it from the mat.
- Keep the thumbnail strip (for multiple images) on the mat; restyle to match (active thumb = teal border).
- No-image fallback (accent gradient + initial) stays as-is.

---

## Group 2 — Branded header v2 (option A: no icon)

### 2A. PageHeader — drop the icon
- Update [page-header.tsx](../../../src/components/brand/page-header.tsx) to render **no icon chip**. Layout becomes: eyebrow (accent) → serif title → subtitle, with the **2px accent rule** under it. Keep the per-section accent (drives eyebrow + rule color).
- Remove the `icon` prop usage from all call sites (showcase, gigs, competitions, events, directory). The `icon` prop may be deleted from the component; if kept for compatibility, it must not render.

### 2B. Apply PageHeader to Builders
- [builders/page.tsx](../../../src/app/builders/page.tsx) currently hand-rolls `<Eyebrow>` + `<h1>`. Replace with `PageHeader` (accent `blue` or a fitting accent; eyebrow "The people behind it" → keep, title "Builders", subtitle current text).

### 2C. Inner-page context breadcrumb
- New small component `SectionCrumb` (server component): renders a slim bar `‹ <Section> / <Name>` where the section label is in its accent color (with a lucide `ChevronLeft`) linking back to the section, and `<Name>` is muted. Border-bottom hairline.
- Place at the top of detail pages: `/showcase/[id]`, `/gigs/[slug]`, `/competitions/[slug]`, `/u/[handle]` (optional), so the branding/context isn't lost. Props: `section` (label), `href`, `accent`, `name`.

---

## Group 3 — Landing page reorg

Rework [page.tsx](../../../src/app/page.tsx). New section order:
1. **Hero** (unchanged).
2. **Browse by** (Group 4 component) — centered.
3. **Top Projects** — rotating, top 5.
4. **Top Creators** — rotating, top 5.
5. **"There's a place for you here"** (the 3 audience cards — unchanged).
6. **"Ready to vibe?"** CTA (unchanged).

- **Remove** the entire "Everything you need" section (the `FEATURES` array + its `<Section>`).
- **Top Projects** (style B): each item = screenshot cover + a **footer bar** (project name left; a small **square upvote** badge right showing the count, matching the `.upvote` style). The **name links to the live site** (`project.url`) in a new tab, or to `/showcase/[id]` if `project.url` is null. Section heading "Top Projects" (serif) with a **"Browse projects →"** link (to `/showcase`) under the row.
- **Top Creators** (style A): each item = vertical tile, avatar (links to `/u/[handle]`), **gold ring on #1**, **medal corner badge on top 3** (gold/silver/bronze), name, followers with a lucide `Users` icon. Section heading "Top Creators" with a **"Browse builders →"** link (to `/builders`) under the row.
- **Rotation:** both rows use a reusable client component **`RotatingRow`** — an auto-advancing carousel showing the top 5, advancing every ~5s, **pause on hover**, with dot indicators and prev/next affordance. Reduced-motion: no auto-advance (static, scrollable).
- **Data:** top projects via `listProjects({ sort: "top", limit: 5 })` (exists). Top creators: add `listTopBuilders(5)` ordered by `follower_count desc` (new query, or extend `listBuilders` with `sort: "followers"`).

---

## Group 4 — Browse-by tags (unified, admin-managed)

### 4A. Data model
- New table **`tags`**: `id`, `label` (display text), `slug` (normalized unique key — lowercased, trimmed, collapsed whitespace), `is_hidden boolean default false`, `source text` (`'auto' | 'admin'`), `created_at`. Unique on `slug`.
- **Auto-feed:** when a project is created/updated, upsert each of its `tags[]` into `tags` (normalize → slug; insert if slug not present, `source 'auto'`; never un-hide an existing hidden tag). Implement in the project create/update server action(s).
- **RLS:** public `SELECT` where `is_hidden = false`; admin-only `INSERT`/`UPDATE`/`DELETE` (mirror the existing admin policy pattern, e.g. `exists(... is_admin)`).
- Migration file `supabase/migrations/<ts>_tags.sql`. *(Apply via the controller's Supabase MCP after the file exists — do not apply from a subagent.)*

### 4B. Browse-by component
- New client component **`BrowseBy`**: a centered "Browse by" label (uppercase, accent), then ONE row of all non-hidden tags as pills, **auto-scrolling marquee** (slow — ~80s loop), edges masked, **hover pauses**. Each pill links to `/showcase?tag=<label>`.
- Used on the landing page (section 2). Tags fetched server-side via new `getBrowseTags()` (select non-hidden labels), passed in.
- The old hardcoded `CATEGORIES` array on the landing is removed in favor of this.

### 4C. Admin tag manager
- New page `/admin/tags` (admin-gated, behind the existing `requireAdminUnlocked`): lists all tags as chips with an **× to remove** (delete, or set `is_hidden = true` for `auto` tags so they don't re-appear), and an **"+ Add tag"** input (insert with `source 'admin'`, normalized slug). Server actions `addTag(label)` and `removeTag(id)` in `src/lib/actions/admin.ts` (or a new `tags.ts`), admin-gated, `revalidatePath('/')` + `/admin/tags`.
- Add an entry to the admin dashboard card grid linking to `/admin/tags`.

---

## Group 5 — Builders ranking + medals

### 5A. Builders sorted by followers
- [builders/page.tsx](../../../src/app/builders/page.tsx): default sort becomes **`follower_count desc`** (most-followed first). Update `listBuilders` to support/ default `sort: "followers"`.

### 5B. Medals + ring on builders
- The **top 3** builders (page 1, no filters applied) get a **medal corner badge** on the avatar: #1 gold, #2 silver (`--muted`-ish), #3 bronze. **#1 also gets a gold ring** around the avatar.
- Implement via a `rank` prop on `BuilderCard` (1-based; only set for the first 3 on unfiltered page 1). The medal badge + ring are brand-styled (no emoji — a small lucide `Medal`/`Award` or a numbered badge).
- Reuse the same ring/medal styling on the landing **Top Creators** tiles.

### 5C. Top project / gig medal
- The single **#1 most-upvoted project** gets a **gold medal chip** on its card cover ("#1 most upvoted"). The single **#1 gig** (by its ranking metric) gets the equivalent on its card.
- Add an optional `topRank?: boolean` (or `medal?`) prop to `ProjectCard` and the gig card; the showcase/gigs pages compute the global #1 id and pass the flag to the matching card. Only the #1 gets it (keep it special).

---

## Edit — Contextual "How it works" links on post forms

- Under each post/submit form, add a clean inline link to the help page: project submit, gig post, competition post, event post/request, and directory listing forms. Label per context, e.g. "New here? See how posting a project works →", linking to `/docs` (the existing How-YidVibe-works page; anchor deep-links can come with the Group 6 docs rewrite).
- Tone: clean and helpful, **not** gatekeepy ("you post and we decide"). Just clarify the flow.
- Implement as a small shared component `FormHelpLink` ({ children, href = "/docs" }) used at the bottom of each form's intro/section.

---

## New components & files (summary)
- `src/components/brand/rotating-row.tsx` (client) — auto-advancing carousel.
- `src/components/landing/top-projects.tsx`, `src/components/landing/top-creators.tsx` (or inline on the landing).
- `src/components/brand/browse-by.tsx` (client) — marquee tag row.
- `src/components/brand/section-crumb.tsx` — inner-page breadcrumb.
- `src/components/brand/form-help-link.tsx`.
- `src/app/admin/tags/page.tsx` + admin tag actions.
- `supabase/migrations/<ts>_tags.sql`.
- Modify: `media-gallery.tsx`, `cover-avatar-input.tsx`, `page-header.tsx`, `builders/page.tsx`, `builder-card.tsx`, `project-card.tsx`, landing `page.tsx`, showcase/gigs/competitions/events/directory pages (header + crumb + help links), `lib/queries.ts`, project form action, `globals.css`.

## Open items for planning
1. `RotatingRow` exact mechanics (auto-advance interval, dots vs arrows) — implementer picks a clean, robust approach; must hover-pause + respect reduced-motion.
2. Confirm the gig "ranking metric" for the #1 medal (likely most recent/most applicants — use the gigs page's existing default ordering; mark the first).
3. Whether `tags` auto-feed lives in the project action (preferred) vs a DB trigger — default to the server action.
