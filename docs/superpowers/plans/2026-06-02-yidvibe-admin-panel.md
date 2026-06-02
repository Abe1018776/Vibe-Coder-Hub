# YidVibe Admin Panel Implementation Plan (Group F)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use `- [ ]` checkboxes.

**Goal:** A real admin app with full control: sidebar shell, Users management (verify/feature/admin + invite), Content management + posting (post-as toggle), and featured/verified surfacing.

**Tech:** Next 15 RSC + server actions, Supabase (@supabase/ssr), Tailwind v4, lucide-react.

**Spec:** [docs/superpowers/specs/2026-06-02-yidvibe-admin-panel-design.md](../specs/2026-06-02-yidvibe-admin-panel-design.md)

## Verification model
No test runner. **Do NOT run `npm run lint`** (hangs). Verify with `npm run typecheck` and (where noted) `npm run build` (`rm -rf .next` first if EINVAL). Commit per task; do NOT push (controller pushes). Brand rules: lucide icons only (no emojis), brand tokens, `--font-display`, reuse primitives.

Run tasks sequentially: **A → B → C → D → E**. The `tags` table and admin policies on projects/comments/gigs/competitions/events already exist. Admin gating uses the existing `requireAdminUnlocked()` from `@/lib/admin`.

---

## Task A: DB migration + service-role helper + query foundation

**Files:** new `supabase/migrations/20260602140000_admin_panel.sql`, new `src/lib/supabase/admin.ts`, `src/lib/queries.ts`.

- [ ] **Step 1 — Migration file** `supabase/migrations/20260602140000_admin_panel.sql`. Use the project's admin predicate `(select p.is_admin from public.profiles p where p.id = auth.uid())`:
```sql
-- Featured profiles
alter table public.profiles add column if not exists is_featured boolean not null default false;

-- Admins can read + update ANY profile (OR's with existing public/own policies).
drop policy if exists "profiles admin select" on public.profiles;
create policy "profiles admin select" on public.profiles for select to authenticated
  using ((select p.is_admin from public.profiles p where p.id = auth.uid()));
drop policy if exists "profiles admin update" on public.profiles;
create policy "profiles admin update" on public.profiles for update to authenticated
  using ((select p.is_admin from public.profiles p where p.id = auth.uid()))
  with check ((select p.is_admin from public.profiles p where p.id = auth.uid()));

-- "Posted as official YidVibe" marker for admin-authored content.
alter table public.gigs add column if not exists posted_as_official boolean not null default false;
alter table public.competitions add column if not exists posted_as_official boolean not null default false;
alter table public.events add column if not exists posted_as_official boolean not null default false;

-- Admin-only: list all users with email (auth.users) + project count.
create or replace function public.admin_list_users(search text default null, filter text default 'all')
returns table (
  id uuid, handle text, name text, avatar_url text, email text,
  follower_count int, is_admin boolean, is_verified boolean, is_featured boolean,
  is_builder boolean, is_public boolean, created_at timestamptz, project_count bigint
) language plpgsql security definer set search_path = public as $$
begin
  if not coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false) then
    raise exception 'not authorized';
  end if;
  return query
  select p.id, p.handle, p.name, p.avatar_url, u.email::text,
    p.follower_count, p.is_admin, p.is_verified, p.is_featured,
    p.is_builder, p.is_public, p.created_at,
    (select count(*) from public.projects pr where pr.owner_id = p.id) as project_count
  from public.profiles p
  join auth.users u on u.id = p.id
  where (search is null or search = '' or p.name ilike '%'||search||'%' or p.handle ilike '%'||search||'%' or u.email ilike '%'||search||'%')
    and (
      filter = 'all'
      or (filter = 'admins' and p.is_admin)
      or (filter = 'verified' and p.is_verified)
      or (filter = 'featured' and p.is_featured)
      or (filter = 'builders' and p.is_builder)
    )
  order by p.created_at desc;
end; $$;
revoke all on function public.admin_list_users(text, text) from public, anon;
grant execute on function public.admin_list_users(text, text) to authenticated;
```
**Confirm before writing:** read the actual `gigs`/`competitions`/`events`/`projects` columns in `src/lib/supabase/types.ts` to verify `owner_id` is the FK column name on projects (adjust the `project_count` subquery if it differs). Do NOT apply the migration (controller applies it).

- [ ] **Step 2 — Service-role helper** `src/lib/supabase/admin.ts` (server-only):
```tsx
import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Service-role admin client. Returns null if the key isn't configured. */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  if (!key || !url) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
export function serviceRoleConfigured(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}
```
Confirm the Supabase URL env var name used in `src/lib/supabase/config.ts`/`server.ts`; if the project hardcodes the URL, import that constant instead of `process.env`.

- [ ] **Step 3 — Queries.** In `src/lib/queries.ts`:
  - Add `adminListUsers(search?: string, filter?: string)` that calls `supabase.rpc("admin_list_users", { search: search ?? null, filter: filter ?? "all" })` and returns `data ?? []`. The `tags`/rpc may not be in generated types — use a narrow cast like the Wave-2 tags approach if needed.
  - Update `listBuilders` and `listTopBuilders` ordering to **`is_featured desc, follower_count desc`** (featured first). Keep other behavior.

- [ ] **Step 4 — Verify & commit.** `npm run typecheck` clean.
```
git add supabase/migrations/20260602140000_admin_panel.sql src/lib/supabase/admin.ts src/lib/queries.ts
git commit -m "feat(admin): migration (is_featured, profiles policy, admin_list_users, posted_as_official) + service-role helper + featured-first ordering"
```

---

## Task B: Admin shell + overview

**Files:** new `src/components/admin/admin-sidebar.tsx`, `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`.

- [ ] **Step 1 — Sidebar** `src/components/admin/admin-sidebar.tsx` (client, uses `usePathname` for active state). Dark branded rail with lucide icons and links: Overview `/admin` (`LayoutGrid`), Users `/admin/users` (`Users`), Content `/admin/content` (`LayoutPanelLeft`), Tags `/admin/tags` (`Tag`), and a "Moderation" group with Reports `/admin/reports` (`Flag`), Feedback `/admin/feedback` (`MessageSquare`), Competition review `/admin/competitions` (`Trophy`), Event requests `/admin/events` (`Calendar`), Directory review `/admin/directory` (`Compass`). Brand: dark teal `#0f1f1c` bg, active item `#1c332e`, serif "YidVibe Admin" with `ShieldCheck`. Include the existing Lock `<form action={lockAdmin}>` at the bottom.

- [ ] **Step 2 — Layout** `src/app/admin/layout.tsx`: keep `await requireAdmin()`. Replace the current top-bar layout with a two-column shell: `<AdminSidebar />` + a `<main className="...">{children}</main>`. On mobile, render the sidebar as a top bar / collapsible (a simple horizontal scroll of the nav is acceptable). Keep `metadata` + the `requireAdmin` gate.

- [ ] **Step 3 — Overview** `src/app/admin/page.tsx`: keep `await requireAdminUnlocked()`. Keep the existing counts `Promise.all` and **add a users count** (`supabase.from("profiles").select("id", { count: "exact", head: true })`). Render a redesigned overview inside the shell: a row of headline stat tiles (Users, Projects, Open reports, Pending comps/events/listings, Open feedback — reuse brand stat styling) + the existing moderation queue link cards. No emojis; lucide icons.

- [ ] **Step 4 — Verify & commit.** `npm run typecheck` clean; `npm run build` green.
```
git add src/components/admin/admin-sidebar.tsx src/app/admin/layout.tsx src/app/admin/page.tsx
git commit -m "feat(admin): sidebar shell + redesigned overview"
```

---

## Task C: Users management + invite

**Files:** new `src/app/admin/users/page.tsx`, `src/components/admin/users-table.tsx`, `src/components/admin/invite-user.tsx`, and actions in `src/lib/actions/admin.ts`.

- [ ] **Step 1 — Actions** in `src/lib/actions/admin.ts`:
```tsx
type UserFlag = "is_verified" | "is_featured" | "is_admin";
export async function setUserFlag(profileId: string, field: UserFlag, value: boolean) {
  await requireAdminUnlocked();
  if (!["is_verified", "is_featured", "is_admin"].includes(field)) return;
  const supabase = await createClient();
  await supabase.from("profiles").update({ [field]: value }).eq("id", profileId);
  revalidatePath("/admin/users"); revalidatePath("/builders"); revalidatePath("/");
}

export async function setUserPublic(profileId: string, isPublic: boolean) {
  await requireAdminUnlocked();
  const supabase = await createClient();
  await supabase.from("profiles").update({ is_public: isPublic }).eq("id", profileId);
  revalidatePath("/admin/users");
}

export async function inviteUser(_prev: { ok?: boolean; error?: string }, formData: FormData) {
  await requireAdminUnlocked();
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Enter an email." };
  const admin = createAdminClient();
  if (!admin) return { error: "Account invites aren't enabled yet — add SUPABASE_SERVICE_ROLE_KEY in Vercel (see docs/ADMIN_SERVICE_ROLE.md)." };
  const { error } = await admin.auth.admin.inviteUserByEmail(email);
  if (error) return { error: error.message };
  revalidatePath("/admin/users");
  return { ok: true };
}
```
Add `import { createAdminClient } from "@/lib/supabase/admin";`. (`requireAdminUnlocked`, `createClient`, `revalidatePath` already imported.)

- [ ] **Step 2 — Users page** `src/app/admin/users/page.tsx` (server): `await requireAdminUnlocked()`; read `searchParams` `{ q?, filter? }`; `const users = await adminListUsers(q, filter)`. Render the page header ("Users"), the search form (GET, `name="q"`) + filter chips (links setting `?filter=`), the `<InviteUser />` button, and `<UsersTable users={users} />`.

- [ ] **Step 3 — UsersTable** `src/components/admin/users-table.tsx` (client): renders the table per the approved mock. Columns: User (avatar + name with inline badges — verified `BadgeCheck` gold, admin `Shield`, featured `Star` teal — + @handle, "· private" if `!is_public`), email, followers, projects, joined (formatRelativeTime or a short date), Actions. Action toggles call the server actions with `useTransition` + optimistic state: **Verify** (`setUserFlag(id,"is_verified",!v)`), **Feature** (`is_featured`), **Admin** (`is_admin`). A `DropdownMenu` (existing Radix) "···" with: View profile (`/u/handle`), Make private/public (`setUserPublic`), and a disabled "Remove user" with a tooltip "needs service-role key" (wire to `removeUser` later). On/off pill styling per the mock (gold/teal/dark).

- [ ] **Step 4 — InviteUser** `src/components/admin/invite-user.tsx` (client): a button opening a Radix `Dialog` with an email input, using `useActionState(inviteUser, {})`; shows the gated message if returned; success toast + close.

- [ ] **Step 5 — Verify & commit.** `npm run typecheck` clean; `npm run build` green.
```
git add src/app/admin/users/page.tsx src/components/admin/users-table.tsx src/components/admin/invite-user.tsx src/lib/actions/admin.ts
git commit -m "feat(admin): users management — verify/feature/admin toggles, make-private, invite (gated)"
```

---

## Task D: Content management + posting

**Files:** new `src/app/admin/content/page.tsx`, `src/components/admin/content-manager.tsx`, `src/components/admin/post-as-control.tsx`, actions in `src/lib/actions/admin.ts`, and the gig/competition/event card + detail components (official display).

- [ ] **Step 1 — Delete actions** in `src/lib/actions/admin.ts` (admin RLS already allows): `deleteGig(id)`, `deleteCompetition(id)`, `deleteEvent(id)` — each `await requireAdminUnlocked(); await createClient().from(<table>).delete().eq("id", id); revalidatePath(...)`. Also `setProjectHidden(id, hidden)` (projects `hidden` flag) mirroring the reports hide. (`setProjectFeatured`, `setCompetitionReviewStatus`, `setDirectoryListingStatus` already exist — reuse.)

- [ ] **Step 2 — Admin post action** `adminPostContent` in `src/lib/actions/admin.ts`: accepts a type (`gig|competition|event`), the fields, and `postAs` (`official` | a `userId`). Inserts into the right table with `owner_id = postAs === "official" ? <current admin id> : userId`, `posted_as_official = postAs === "official"`, and published state (comp `review_status:"approved"`, event as real row, gig open). Read each table's required columns first. Admin-gated.

- [ ] **Step 3 — Content page** `src/app/admin/content/page.tsx` (server): `requireAdminUnlocked()`; read `?type=` (default `projects`); fetch the list for that type (newest first; admin sees all incl. hidden/pending); render sub-tab links + `<ContentManager type=... items=... />` + the composer trigger.

- [ ] **Step 4 — ContentManager** `src/components/admin/content-manager.tsx` (client): renders each item row per the mock (thumb + title + owner/stat + action pills). Wires Feature/Hide/Delete/Approve to the actions with `useTransition` + inline confirm for destructive ones (no native popups). Edit = a link to the existing edit route where one exists; otherwise omit Edit.

- [ ] **Step 5 — PostAsControl + composer** `src/components/admin/post-as-control.tsx` (client): the segmented "Official YidVibe / A user" control + a user picker (searches via a lightweight server action or a passed-in user list) that sets a hidden `postAs` field. Wire a composer form (in the content page or a `/admin/content/post` sub-page) to `adminPostContent`. Keep it brand-styled; publishes immediately.

- [ ] **Step 6 — Official display.** In the gig, competition, and event **card + detail** components, when `posted_as_official` is true, show "by YidVibe" with a small official badge (lucide `BadgeCheck`/`ShieldCheck` + brand) instead of the owner identity. Read each component to wire the field through (the list queries must select `posted_as_official`).

- [ ] **Step 7 — Verify & commit.** `npm run typecheck` clean; `npm run build` green.
```
git add src/app/admin/content/page.tsx src/components/admin/content-manager.tsx src/components/admin/post-as-control.tsx src/lib/actions/admin.ts <gig/comp/event card+detail files touched>
git commit -m "feat(admin): content management + post-as composer + official display"
```

---

## Task E: Featured + verified surfacing

**Files:** `builder-card.tsx`, `project-card.tsx`, `u/[handle]/page.tsx`, `builders/page.tsx`, landing `page.tsx`.

- [ ] **Step 1 — Badges.** Show a **Verified** badge (lucide `BadgeCheck`, gold) and a **Featured** star (lucide `Star`, teal) wherever the builder identity appears: `builder-card.tsx` (near the name), the profile hero in `u/[handle]/page.tsx` (next to the existing verified `Sparkle` — add featured star when `is_featured`), and the `project-card.tsx` foot (`by <owner>` — add badges if the owner is verified/featured; only if owner fields are available there). Reuse brand tokens; small icons.

- [ ] **Step 2 — Featured-first lists.** `listBuilders`/`listTopBuilders` already order `is_featured desc, follower_count desc` (Task A). Confirm `builders/page.tsx` (sorted by followers from Wave 2) now naturally shows featured first; and the landing **Top Creators** (uses `listTopBuilders`) shows featured first. Ensure the builder objects include `is_verified`/`is_featured` (extend the select in `listBuilders`/`listTopBuilders` if missing).

- [ ] **Step 3 — Verify & commit.** `npm run typecheck` clean; `npm run build` green.
```
git add src/components/brand/builder-card.tsx src/components/brand/project-card.tsx "src/app/u/[handle]/page.tsx" src/app/builders/page.tsx src/app/page.tsx
git commit -m "feat(admin): verified + featured badges and featured-first surfacing"
```

---

## Docs + final gate (controller)
- [ ] Create `docs/ADMIN_SERVICE_ROLE.md` — exact steps to add `SUPABASE_SERVICE_ROLE_KEY` in Vercel (Settings → Environment Variables → add for Production → redeploy), noting it enables Invite + Remove user. (Can be done by a task or the controller.)
- [ ] Apply `20260602140000_admin_panel.sql` via Supabase MCP `apply_migration`.
- [ ] `npm run typecheck` clean; `npm run build` green (clear `.next` if EINVAL).
- [ ] Push `main` → production; confirm Vercel READY.
- [ ] Spec coverage: F1 shell ✓, F2 users ✓, F3 invite (gated) ✓, F4 content+posting ✓, F5 featured ✓.
