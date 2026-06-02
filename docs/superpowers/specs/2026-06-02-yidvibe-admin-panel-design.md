# YidVibe Admin Panel — design (Group F)

**Date:** 2026-06-02
**Status:** Approved for spec review
**Scope:** A real admin app with 100% control: shell, full Users management, full Content management + posting, featured-creator surfacing, and an email-invite scaffold. Out of scope this round: **D** (sign-in branding — guided config).

**Brand rules (non-negotiable):** lucide-react icons only — no emojis; `--font-display` serif; brand tokens only; reuse brand primitives. See [[brand-fidelity-no-cheap-ui]].

**Locked decisions (from brainstorming):**
- Add accounts → **email invite** (needs a Supabase service-role key in Vercel; build gated on it).
- Account flags → **Verified** (trust badge) + **Featured** (surfaces + star).
- Admin posting → **choose each time**: *Official YidVibe* or *a chosen user*.

## Existing constraints (verified)
- Admin RLS "for all" policies already exist on `projects, comments, gigs, competitions, events`; `directory_listings` + `tags` have admin policies. **`profiles` has NO admin policy yet** → must add one.
- `guard_profile_admin_update` trigger *allows* an admin to change `is_admin` (blocks only non-admins) → "make admin" works once an admin profiles-update policy exists.
- `profiles` has `is_admin, is_verified, is_builder, is_public` but **no `is_featured`** → add it.
- User **email lives in `auth.users`**, not `profiles`, and isn't readable with the public key → expose via a SECURITY DEFINER RPC (no service-role needed for the read).
- **No service-role key** in the app → account *creation/invite* and *full user deletion* need `SUPABASE_SERVICE_ROLE_KEY` added in Vercel; everything else does not.

---

## Migrations (one file, `<ts>_admin_panel.sql`)
1. `alter table public.profiles add column if not exists is_featured boolean not null default false;`
2. Admin policies on `profiles`:
   - admin SELECT all: `for select to authenticated using ((select p.is_admin from public.profiles p where p.id = auth.uid()))` (named so it OR's with the existing public/own select).
   - admin UPDATE any: `for update to authenticated using (<admin predicate>) with check (<admin predicate>)`.
3. `admin_list_users(search text, filter text)` — `security definer`, `set search_path = public`, **raises unless caller is admin**, returns `profiles.*` + `email` (join `auth.users u on u.id = p.id`) + `project_count`, filtered by search (name/handle/email ilike) and filter (`all|admins|verified|featured|builders`), ordered by `created_at desc`. `grant execute ... to authenticated`.
4. `alter table public.gigs|competitions|events add column if not exists posted_as_official boolean not null default false;` — drives the "post as Official YidVibe" display without needing a system auth user.

*(Controller applies the migration via Supabase MCP after the file exists.)*

---

## F1 — Admin shell
- Replace the flat card grid with a **sidebar app**. Update [admin/layout.tsx](../../../src/app/admin/layout.tsx) to render a dark branded left sidebar (lucide icons + serif "YidVibe Admin") with nav: **Overview** (`/admin`), **Users** (`/admin/users`), **Content** (`/admin/content`), **Tags** (`/admin/tags`), **Moderation** (a group → Reports/Feedback/Competition review/Event requests/Directory review), and a **Lock** action at the bottom. Active state highlights the current section. Mobile: collapses to a top bar / drawer.
- **Overview** (`/admin/page.tsx`) redesigned: headline counts (users, projects, open reports, pending comps/events/listings, open feedback) + the existing moderation queue cards, in the new shell.
- All existing admin sub-pages keep working, restyled to sit inside the shell.

## F2 — Users management (`/admin/users`)
- Admin-gated page (`requireAdminUnlocked`). Server fetch via `supabase.rpc("admin_list_users", { search, filter })`.
- **Table** of all users: avatar + name (inline badges: verified = gold `Sparkle`/`BadgeCheck`, admin = `Shield`, featured = `Star`), `@handle` (+ "private" if not public), email, followers, projects, joined.
- **Search** (name/handle/email) + **filter chips** (All / Admins / Verified / Featured / Builders) via query params.
- **Per-row one-click toggles**: Verify (`is_verified`), Feature (`is_featured`), Admin (`is_admin`) — each a server action `setUserFlag(profileId, field, value)` (admin-gated; `field` whitelisted to those three). On/off styling per the mock (gold/teal/dark).
- **"···" menu**: View profile (`/u/handle`), View their posts, Make private (`is_public=false`), and **Remove user** (gated on the service-role key — disabled with a note until configured).
- Implement as a `UsersTable` client component (optimistic toggles) fed by the server page; row actions call the server actions.

## F3 — Invite accounts (`/admin/users` → "Invite user")
- An "Invite user" action/dialog: admin enters an email (+ optional name). Server action `inviteUser(email)` creates a **service-role admin client** from `process.env.SUPABASE_SERVICE_ROLE_KEY` and calls `auth.admin.inviteUserByEmail(email)`.
- If the env var is **absent**, the action returns a clear "Account creation isn't enabled yet — add SUPABASE_SERVICE_ROLE_KEY in Vercel" message, and the UI shows a small note. Build it now; it activates when the key is added. (Same gating covers "Remove user".)
- Deliverable for the user: a short `docs/ADMIN_SERVICE_ROLE.md` with the exact Vercel env-var steps.

## F4 — Content management + posting (`/admin/content`)
- Admin-gated page with **sub-tabs** (`?type=projects|gigs|competitions|events|directory`, default projects). Each lists items (newest first) with owner + key stat.
- **Per-item actions** (reuse existing admin RLS + actions; add new where missing):
  - Projects: **Feature** (`setProjectFeatured`, exists), **Hide** (`hidden` flag, like reports), **Delete**, **Edit** (link to the project edit page).
  - Gigs / Competitions / Events: **Delete** (new admin action per type; admin RLS allows), **Edit** (link), plus **Approve** where it applies (competitions `review_status`, events requests, directory `status` — reuse `setCompetitionReviewStatus`, `setDirectoryListingStatus`).
  - Directory: Approve/Reject (exists) + Delete.
  - All destructive actions confirm inline (no native popups), match the graceful pattern.
- **Composer** — "+ Post gig / competition / event": a small admin form (or links to dedicated admin post forms) that publishes immediately (comps → `review_status: approved`; events → real `events` row, not a request; gigs → open). A **"Post as" segmented control**: *Official YidVibe* (sets `posted_as_official = true`, `owner_id = current admin`) or *A user* (a searchable user picker → `owner_id = chosen user`, `posted_as_official = false`).
- **Official display:** the gig/competition/event card + detail show "by YidVibe" with a small official badge when `posted_as_official` is true, instead of the owner identity. Add this to the relevant card/detail components.

## F5 — Featured creators & promotion (the payoff)
- **Builders page**: featured profiles (`is_featured`) sort to the very top (before the by-follower order), each with a **Featured star** + ring; verified profiles show the verified badge. (Builds on the Wave-2 ranking.)
- **Landing Top Creators**: prefer featured profiles first, then top by followers.
- **Profile + cards**: show the **Verified** badge (`is_verified`) and a **Featured** star (`is_featured`) wherever the builder identity appears (profile hero, builder cards, project card foot), using lucide icons + brand tokens.
- `listBuilders` / `listTopBuilders` updated to order `is_featured desc, follower_count desc`.

---

## New / changed files (summary)
- Migration `supabase/migrations/<ts>_admin_panel.sql`.
- `src/app/admin/layout.tsx` (shell), `src/app/admin/page.tsx` (overview), new `src/app/admin/users/page.tsx`, new `src/app/admin/content/page.tsx`.
- New `src/components/admin/admin-sidebar.tsx`, `users-table.tsx`, `content-manager.tsx`, `invite-user.tsx`, `post-as-control.tsx`.
- Admin actions in `src/lib/actions/admin.ts`: `setUserFlag`, `inviteUser`, `removeUser` (gated), `deleteGig/Competition/Event`, admin-post actions.
- Service-role admin client helper `src/lib/supabase/admin.ts` (reads `SUPABASE_SERVICE_ROLE_KEY`; throws/returns disabled if missing).
- Queries: `admin_list_users` RPC wrapper; `listBuilders`/`listTopBuilders` featured-first.
- Display: gig/competition/event card + detail components honor `posted_as_official`; builder/profile/project components show verified + featured badges.
- `docs/ADMIN_SERVICE_ROLE.md`.

## Open items for planning
1. `admin_list_users` exact return columns + the admin-check (`raise exception 'not authorized'`).
2. Composer: dedicated admin post forms vs reusing the public post forms with an admin "post as" header — implementer picks the cleaner path; both publish immediately.
3. Confirm gigs/competitions/events FK + required fields for admin inserts (read each table).
4. Service-role helper must never be imported into client components (server-only).
