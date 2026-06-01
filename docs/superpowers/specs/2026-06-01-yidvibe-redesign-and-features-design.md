# YidVibe — Redesign & Features Design Spec (2026-06-01)

Decisions agreed with the owner on 2026-06-01 for the next build round on `feat/redesign`.
Builds on `2026-05-29-yidvibe-build-design.md` (stack, RLS patterns, triggers, storage) and
the brand docs (BRAND.md / DESIGN.md / COPY.md) which stay authoritative for visual tokens.

**This spec overrides one prior decision:** the old "attributed-only, `projects.owner_id NOT
NULL`, no anonymous path" rule is replaced by the **anonymous-aware privacy model** below.

## Goal
Make YidVibe genuinely good on **mobile + tablet**, give it a **consistent, exciting visual
system** across every page, add the **privacy model** the four audiences need, and ship the
agreed **new features** (post-picker, Directory listings, follow, save, share, feedback).

## The four audiences (context, not stored verbatim)
1. Builders / vibe-coders — want to be discoverable.
2. Businesses / clients — looking for products or people.
3. Investors — looking for ideas; want privacy.
4. Explorers — browsing for partners/ideas; want privacy.
The model below serves all four without forcing a "type" choice.

---

## 1. Accounts & privacy model (the foundation)

- **Private by default.** A new account has **no public profile page** and appears in **no
  listing**. `profiles.is_public = false` until the user acts.
- **Going public.** The **first time** a user posts (project / gig / competition entry) or
  comments **under their name**, show a one-time **"Make profile public"** prompt: choose
  **display identity** (real name vs handle), **which contact fields** are shown, and whether
  bio/location show. On confirm → `is_public = true`, `went_public_at = now()`.
- **Anonymous always available.** Every project, competition entry, and comment has a
  **"Post anonymously"** option → attributed to **"Anonymous"** (placeholder `?` avatar),
  profile is **never** exposed and `is_public` stays unchanged.
- **Builder/freelancer flag.** Self-declared in profile setup (`is_builder`). When true the
  member is **auto-listed on `/builders`** and gets the **only visible role label**.
- **Available for hire.** Separate flag (`available_for_hire`) = open to new work → green
  badge + a Builders filter. Independent of `is_builder`.
- **Verified.** Admin-granted (`is_verified`). Shows a **gold star** next to the name and
  **"Verified"** as the profile status; everyone else shows **"Member"**.
- **What private accounts can do:** browse/search everything; **save**, **upvote**, **follow**
  (follow = count-only, see §7); **comment anonymously**; and **contact builders by revealing
  the builder's own public contact info** (off-platform — no inbox needed for general contact).
- **Gig applications are the exception:** they stay as the **existing private in-app message**
  to the gig poster ("Apply privately — goes straight to <poster>, no one else sees it").

## 2. Navigation & information architecture
- **Builders** (`/builders`) = signed-up **members** area. It **absorbs the tool/skill/
  available search + facets** currently on `/directory` (one searchable members grid +
  curated "Available for hire" / "Newest" sections on top).
- **Directory** (`/directory`) = **repurposed** to a lightweight listing of *"who you are /
  what you do / what you want"*, open to **anyone with no signup** via the **"Get listed"**
  form, **admin-approved**, browsed by **category + search** (§5). Backed by its own table.
- Both remain in the nav. **Home/landing stays as-is** (owner: "it's good").

## 3. Mobile / tablet UX
- **Top bar:** logo left; **notification bell + avatar top-right** (avatar opens the account
  menu: Your profile, Edit profile, Settings, Sign out). **Hide-on-scroll-down /
  show-on-scroll-up** behavior (replaces the current always-sticky-but-drifting header).
- **Tablet:** keep the **bottom tab bar** up to `lg` (~1024px); desktop top-nav at `lg+`.
  (Tablet currently has neither nav links nor account access — this fixes it.)
- **Filters:** replace the always-on filter row with a **"Filters" button → bottom sheet**
  (Tool / Skill / Available, with **Clear** + **Apply**); active filters render as removable
  **chips** under the search. Search input stays inline. Same search look on every list page.
- **Pagination:** **numbered pagination** at the bottom of every list (page numbers, finite
  end). Also **fix the overscroll/layout bug** so the page ends cleanly at the footer
  (audit `min-h-dvh` + `pb-16` interplay + any horizontal overflow).
- **Footer:** **darker background** (e.g. a deeper surface/ink tint) to visually separate it
  from the page body.

## 4. Post / submit flow
- The bottom-nav **+** and the desktop action button become **"Post"** → a **bottom-sheet
  chooser**: **Project · Gig · Competition**.
  - **Project, Gig:** post freely (any signed-in user).
  - **Competition:** full form → saved as **pending** → **admin approval** → publishes when
    approved. There IS a "Submit a competition" entry in the sheet.
- **Events = admin-only.** No post entry in the sheet. The **Events page bottom** has a
  **"Request to post an event"** link → full info form → **admin review**; on submit the user
  sees **"we'll be in touch via email."**
- **All forms adopt the redesigned Submit look:** URL + **Autofill (button pulse + sparkles
  animation)**, cover image + up to 5 screenshots, **tool & tag chip pickers**, the
  **"Looking for… (Funding / Buyer / Partners)"** commercial row, and the **Post anonymously**
  toggle. Gig/competition forms reuse the same components and copy tone.

## 5. Directory listings (new feature)
- **"Get listed — it's free"** CTA on the Directory page → application form:
  **name/business, what you do, what you want to do, category, contact (email/phone/website/
  whatsapp), optional logo** — **no signup required**.
- On submit: create a **pending `directory_listings` row** and a **pending item in the admin
  queue**. Email to `directory@yidvibe.com` is **deferred** until an outbound email provider
  exists (best-effort later; the in-app queue is the source of truth now). Submitter sees
  **"we'll be in touch."**
- Admin **Approve → status `approved` (live)** / **Reject → `rejected` (archived)**.
- Browse: **category chips + free-text search + numbered pagination**.

## 6. Profile redesign (members) — the "Dicta / YidVibe Community" banner style
- **Banner:** uploadable **cover image** with an **on-brand accent gradient fallback**; avatar
  overlaps the banner; **Follow + ⋯** on the banner (own profile shows **Edit profile**).
- **Name row:** name + **gold star if verified**; `@handle` beneath.
- **Stat row:** **Projects · Total upvotes · Followers · Joined date**, plus status
  (**Member / Verified**).
- **Tools & Skills:** **two separate rows** ("Tools", "Skills"); each shows the **first 3** in
  the user's order + a **"+N more"** control that **expands inline**. Edit form allows adding
  unlimited tools/skills.
- **Contact buttons** (Email / Call / etc.) from the public contact links; **Available-for-hire**
  badge when set.

## 7. Cards & interactions (consistent across the whole site)
- **Card anatomy:** gradient/letter cover, **"Live" badge** when a live link exists,
  **save-star top-right**, a tool pill, tags, the **upvote count**, and **"by <name> →"**
  (Anonymous-aware). Used on Showcase, Builders, Gigs, Competitions, Events, Directory.
- **Save / star:** **account-only**; toggles a private bookmark. Saved items live on a private
  **`/saved`** page reachable from the avatar menu. Never shown to others.
- **Share:** **native share sheet where available + copy-link fallback** (with a "Copied!"
  confirmation). On cards **and** detail pages.
- **Follow:** on every builder. Following = **the follower gets notified when that builder
  posts**; the builder sees a **follower count only** (no names) — preserves browser privacy.
- **Upvote animation:** the upvote control **fills with color slowly, bottle-style, bottom→top**;
  when full it **pops with a sparkle burst + the number springs up**. Voted state persists as a
  **filled teal "Upvoted"** control (per the project-detail screenshot).
- **Clickable tags/tools/skills (smart per context):** on projects, **tags & tools** link to
  **Showcase filtered** by that value; on profiles, **tools & skills** link to **Builders
  filtered** by that value.

## 8. Detail pages (one consistent system)
Project, gig, competition, and profile pages share the **accent gradient cover** (title + tags
overlaid, faint watermark glyph) + a **right rail of contextual cards**:
- **Project:** Upvote + Share · Built by (Anonymous-aware) · Built with (tools).
- **Gig:** Budget · Applicants · Posted (relative) · Posted-by + View profile · Skills needed ·
  **"Apply privately"** in-app message form.
- **Competition:** Prize · Status · Deadline · Entries · Hosted-by + View profile ·
  **"Submit an entry."**
- **Accent per section:** teal = Showcase/project, **clay/orange = Gigs**, **gold =
  Competitions**; assign **Events** and **Directory** their own brand accents (e.g. blue / sage)
  consistent with BRAND.md.

## 9. Feedback widget (new)
- A **slim vertical "Feedback" tab on the right edge**, visible to **everyone (logged in or
  out)**; does not collide with the mobile bottom nav / Post button.
- Form: **like / dislike / suggestion** text + **auto-captured page URL** + a **"send with my
  name" vs "send anonymously" toggle**. Lands in the **admin queue** as `feedback` rows.

## 10. Also folded in
- **`/saved`** bookmarks page (account-only).
- **Empty-state & loading-state polish** pass across pages (skeletons, friendly empties).

---

## Data model deltas (Supabase; follow existing RLS-deny-by-default + trigger conventions)
- **`profiles`** add: `is_public bool default false`, `went_public_at timestamptz`,
  `is_builder bool default false`, `is_verified bool default false`, `cover_url text`,
  `display_as text` (`'name' | 'handle'`), and a **public-field visibility** map
  (`public_fields jsonb` — which contact/bio fields show). `available_for_hire` already exists.
- **`follows`** `(follower_id, builder_id, created_at)`, `UNIQUE(follower_id,builder_id)`;
  denormalized `profiles.follower_count` via insert/delete triggers.
- **`saves`** `(user_id, project_id, created_at)`, `UNIQUE(user_id,project_id)`; private to the
  user (RLS: read/write own rows only).
- **`directory_listings`** `(id, name, what_you_do, wants, category, contact jsonb, logo_url,
  status enum 'pending'|'approved'|'rejected', submitted_by uuid null, created_at)`.
  Public read only where `status='approved'`; insert open (anonymous allowed); update/approve
  = admin only.
- **`feedback`** `(id, body, sentiment 'like'|'dislike'|'idea' null, page_url, is_anonymous
  bool, submitter_id uuid null, submitter_contact text null, status, created_at)`. Insert open;
  read/manage = admin only.
- **`event_requests`** `(id, title, details, contact, requester_id null, status, created_at)`
  for the admin-reviewed event inquiry.
- **`competitions`** add a **moderation** state `review_status 'pending'|'approved'|'rejected'`
  (distinct from the existing `competition_status open|judging|closed` lifecycle) so the
  submit→approve flow gates publishing. Only `approved` competitions are public.
- **`projects`** + **`comments`** add `is_anonymous bool default false`; relax
  `projects.owner_id` to allow the anonymous-but-owned case (keep `owner_id` for the author's
  private record, hide it on render when anonymous). Keep `upvote_count` trigger.
- **`notifications`** add type **`follow_post`** ("someone you follow posted"). Admin-routed
  notifications for new directory listings, competition submissions, event requests, feedback.
- **Storage:** reuse `avatars` for covers under `<uid>/cover/...` (or add a `covers` bucket);
  add a `directory-logos` public bucket for no-account listing logos.

## RLS notes
- `is_public`-aware reads: a profile and its attributed content render publicly **only when
  `is_public` or the row is the viewer's own**; anonymous rows never expose `owner_id`.
- `follows`/`saves`: standard "write/read own row." `follower_count` exposed via the profile.
- `directory_listings`, `feedback`, `event_requests`: public **insert**, admin-gated read/update
  (except approved directory listings which are public-read).

## Build order (owner pick: UI/mobile + profile first)
**Phase 1 — Look & feel + responsive (mostly front-end).**
Nav/top-bar avatar + hide-on-scroll, tablet bottom-bar, Filters bottom sheet, numbered
pagination + overscroll-bug fix, darker footer; banner profile + Tools/Skills two-row +N +
stat row + verified gold star; unified card design everywhere; **upvote bottle-fill +
sparkle** animation; **share** + **save** (`/saved`); **clickable tags/tools/skills**; Autofill
**pulse+sparkle**; apply the redesigned form styling; detail-page consistency (Events/Directory
accents); empty/loading polish. *(Creates the small `follows` + `saves` tables it needs.)*

**Phase 2 — Privacy & accounts + follow.**
`is_public` default-false + the first-post **"Make profile public"** prompt with field choices;
**anonymous** posting/commenting end-to-end (incl. `is_anonymous` columns + Anonymous render);
`is_builder` vs `available_for_hire`; **follow notifications** (`follow_post`).

**Phase 3 — New features & admin.**
**Post** bottom-sheet picker; **competition submit → admin approve**; **event request** flow;
**Directory listings** + "Get listed" form + admin queue; **feedback** right-edge tab + admin
queue. Wire `directory@yidvibe.com` email if/when a provider exists.

## Constraints / notes
- Work on **`feat/redesign`** with **local commits**; pushing to the partner remote is blocked.
- Outbound email is **deferred** (admin in-app queue is the source of truth until a provider/key
  exists); Google-OAuth limitation noted — email/password auth remains the primary path.
- Keep the stack: Next 15 RSC + Server Actions + Zod, Supabase RLS, Tailwind v4, shadcn `ui/`.
