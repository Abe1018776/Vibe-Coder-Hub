# Dashboard Consolidation & Mobile Pass — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring Saved & Profile into the dashboard so every section shares one sticky chrome, rebuild Profile/Account cleanly, surface an owner-only Admin entry, fix the Back button, and ship a premium Direction-C mobile dashboard + cleaner bottom bar.

**Architecture:** Next 15 App Router + Supabase, Tailwind. Desktop keeps the sticky greeting + pill tab rail; mobile (`<lg`) uses a hub-list (drill-down) dashboard. No backend changes except setting the owner's `is_admin` flag. Responsive is done purely with `lg:` breakpoints — desktop is untouched.

**Tech Stack:** TypeScript, React Server Components, lucide-react icons, existing brand primitives (`Panel`, `AvatarCircle`, `StatGrid`, `Pill`, `Sparkle`), `@radix-ui/react-dropdown-menu`.

**Verification reality:** No test runner. `next dev` is blocked by the OneDrive symlink `EINVAL`. Per-task gate = `npm run typecheck` (always works). Integration gate (final task) = `npm run build` + `npm run lint` (run `rm -rf .next` first if the `.next/diagnostics EINVAL` flake hits). Visual verification = owner eyeballs the `feat/redesign` Vercel preview on desktop + phone. Work directly on `feat/redesign` (established workflow; no worktree).

---

## File Structure

**Create**
- `src/app/dashboard/saved/page.tsx` — Saved content (moved from `/saved`).
- `src/app/dashboard/profile/page.tsx` — Profile edit form with a dashboard header (moved from `/settings/profile`).
- `src/components/dashboard/dashboard-mobile-bar.tsx` — client; `lg:hidden`; greeting on hub root, "‹ Dashboard" back link on sub-pages.
- `src/components/dashboard/dashboard-hub.tsx` — mobile hub: 3-stat strip + section rows (Admin row owner-only).

**Modify**
- `src/app/saved/page.tsx` → redirect stub to `/dashboard/saved`.
- `src/app/settings/profile/page.tsx` → redirect stub to `/dashboard/profile`.
- `src/components/dashboard/dashboard-tabs.tsx` — new hrefs; rail becomes `hidden lg:block`.
- `src/components/site/user-menu.tsx` — Saved & Edit-profile hrefs → dashboard routes.
- `src/app/dashboard/layout.tsx` — responsive chrome; fetch `getAdminContext`; render mobile bar vs desktop greeting+rail.
- `src/app/dashboard/page.tsx` — overview panels `hidden lg:block`; render `DashboardHub` `lg:hidden`.
- `src/app/dashboard/account/page.tsx` — rebuild identity card (no overlap), trim form duplication, add owner-only Admin card near Sign out.
- `src/components/brand/back-link.tsx` — dumb button (gating lifted to ContextBar).
- `src/components/site/context-bar.tsx` — mounted+history gate so Back only shows when warranted; remove `/saved` from `NO_BACK`.
- `src/components/site/mobile-bottom-nav.tsx` — recompose to Home · Explore · ＋ · Inbox · You.

**Execution-only (no file)**
- Supabase: `update profiles set is_admin = true` for the owner.
- Vercel: set `ADMIN_PASSCODE` env (owner-facing).

---

## Task 1: Consolidate Saved & Profile into the dashboard

**Files:**
- Create: `src/app/dashboard/saved/page.tsx`
- Create: `src/app/dashboard/profile/page.tsx`
- Modify: `src/app/saved/page.tsx`
- Modify: `src/app/settings/profile/page.tsx`
- Modify: `src/components/dashboard/dashboard-tabs.tsx`
- Modify: `src/components/site/user-menu.tsx`

- [ ] **Step 1: Create `src/app/dashboard/saved/page.tsx`** — move the current `/saved` body in, but drop the page-level `<Container>` wrapper (the dashboard layout already wraps content) and the standalone header; use a dashboard section header to match the other tabs.

```tsx
import { redirect } from "next/navigation";
import { Star, Lock } from "lucide-react";
import { getAuthUser } from "@/lib/current-user";
import { listSavedProjects, getMyUpvotedProjectIds } from "@/lib/queries";
import { ProjectCard } from "@/components/brand/project-card";
import { EmptyState } from "@/components/brand/empty-state";

export const metadata = { title: "Saved · Dashboard" };

export default async function DashboardSaved() {
  const user = await getAuthUser();
  if (!user) redirect("/login?next=/dashboard/saved");

  const [projects, upvoted] = await Promise.all([
    listSavedProjects(),
    getMyUpvotedProjectIds(),
  ]);
  const count = projects.length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
            Saved
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Projects you starred — private to you.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-[var(--shadow-xs)]">
          <Lock size={13} />
          {count === 0 ? "Only you" : `${count} saved · only you`}
        </span>
      </div>

      {count === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<Star size={22} />}
          title="Nothing saved yet"
          description="Tap the star on any project to keep it here. Your saves are private — only you can see them."
          actionHref="/showcase"
          actionLabel="Browse the Showcase"
        />
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              isAuthed
              upvoted={upvoted.has(p.id)}
              saved
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create `src/app/dashboard/profile/page.tsx`** — profile edit form with a left-aligned dashboard header (replaces the centered marketing header).

```tsx
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/current-user";
import { ProfileForm } from "@/components/profile/profile-form";

export const metadata = { title: "Profile · Dashboard" };

export default async function DashboardProfile() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/profile");

  return (
    <div className="mx-auto max-w-2xl">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
          Profile
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          How you appear to clients and the community.
        </p>
      </div>
      <div className="mt-6">
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Replace `src/app/saved/page.tsx` with a redirect stub.**

```tsx
import { redirect } from "next/navigation";

export default function SavedRedirect() {
  redirect("/dashboard/saved");
}
```

- [ ] **Step 4: Replace `src/app/settings/profile/page.tsx` with a redirect stub.**

```tsx
import { redirect } from "next/navigation";

export default function SettingsProfileRedirect() {
  redirect("/dashboard/profile");
}
```

- [ ] **Step 5: Update tab hrefs + make the rail desktop-only** in `src/components/dashboard/dashboard-tabs.tsx`.

In the `TABS` array, change:
```tsx
  { href: "/saved", label: "Saved", icon: Bookmark },
```
to
```tsx
  { href: "/dashboard/saved", label: "Saved", icon: Bookmark },
```
and
```tsx
  { href: "/settings/profile", label: "Profile", icon: UserCog },
```
to
```tsx
  { href: "/dashboard/profile", label: "Profile", icon: UserCog },
```
Then change the `<nav …>` wrapper's className to be desktop-only — add `hidden lg:block` to the existing classes:
```tsx
    <nav
      aria-label="Dashboard sections"
      className="hidden -mx-5 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:px-0 lg:block"
    >
```

- [ ] **Step 6: Update `src/components/site/user-menu.tsx` links.**

Change `<Item href="/saved">Saved</Item>` → `<Item href="/dashboard/saved">Saved</Item>` and `<Item href="/settings/profile">Edit profile</Item>` → `<Item href="/dashboard/profile">Edit profile</Item>`.

- [ ] **Step 7: Typecheck.**

Run: `npm run typecheck`
Expected: PASS (no errors).

- [ ] **Step 8: Commit.**

```bash
git add src/app/dashboard/saved src/app/dashboard/profile src/app/saved src/app/settings/profile src/components/dashboard/dashboard-tabs.tsx src/components/site/user-menu.tsx
git commit -m "Dashboard: move Saved & Profile into /dashboard (shared chrome) + redirect old routes"
```

---

## Task 2: Responsive dashboard chrome + mobile hub (Direction C)

**Files:**
- Create: `src/components/dashboard/dashboard-mobile-bar.tsx`
- Create: `src/components/dashboard/dashboard-hub.tsx`
- Modify: `src/app/dashboard/layout.tsx`
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Create `src/components/dashboard/dashboard-mobile-bar.tsx`** — greeting on the hub root, a back link on sub-pages. Client (needs `usePathname`), `lg:hidden`.

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/**
 * Mobile-only top strip for the dashboard. On the hub root it shows the
 * greeting; on a section sub-page it shows a "‹ Dashboard" back link so the
 * Direction-C drill-down always has a clear way home. Desktop uses the tab rail.
 */
export function DashboardMobileBar({ firstName }: { firstName: string }) {
  const pathname = usePathname();
  const onHub = pathname === "/dashboard";

  if (onHub) {
    return (
      <div className="lg:hidden">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-700">
          Your dashboard
        </p>
        <h1 className="mt-1 font-display text-[22px] font-bold tracking-tight text-ink">
          Hi, {firstName}
        </h1>
      </div>
    );
  }

  return (
    <Link
      href="/dashboard"
      className="lg:hidden -ml-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-semibold text-teal-800 transition-colors hover:bg-teal-50"
    >
      <ArrowLeft size={16} /> Dashboard
    </Link>
  );
}
```

- [ ] **Step 2: Create `src/components/dashboard/dashboard-hub.tsx`** — the mobile hub: a 3-stat strip + section rows. Admin row renders only when `isAdmin`.

```tsx
import Link from "next/link";
import {
  FolderOpen,
  Bookmark,
  Inbox,
  UserCog,
  Settings,
  ShieldCheck,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

function HubRow({
  href,
  icon: Icon,
  label,
  badge,
  gold,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
  gold?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3.5 px-4 py-3.5 transition-colors active:bg-teal-50/60"
    >
      <span
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
          gold ? "bg-gold-50 text-gold-700" : "bg-teal-50 text-teal-700",
        )}
      >
        <Icon size={17} />
      </span>
      <span className="flex-1 text-[15px] font-semibold text-ink">{label}</span>
      {badge ? (
        <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-gold-500 px-1.5 text-[11px] font-bold leading-5 text-gold-900">
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
      <ChevronRight size={17} className="shrink-0 text-muted-foreground/50" />
    </Link>
  );
}

/** Mobile-only (`lg:hidden`) dashboard hub — Direction C drill-down list. */
export function DashboardHub({
  posts,
  upvotes,
  followers,
  unread,
  isAdmin,
}: {
  posts: number;
  upvotes: number;
  followers: number;
  unread: number;
  isAdmin: boolean;
}) {
  return (
    <div className="lg:hidden">
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { value: posts, label: "Posts" },
          { value: upvotes, label: "Upvotes" },
          { value: followers, label: "Followers" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border bg-surface px-3 py-3 text-center shadow-[var(--shadow-xs)]"
          >
            <p className="font-display text-xl font-bold text-ink">{s.value}</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-xs)]">
        <HubRow href="/dashboard/posts" icon={FolderOpen} label="My posts" />
        <HubRow href="/dashboard/saved" icon={Bookmark} label="Saved" />
        <HubRow
          href="/dashboard/inbox"
          icon={Inbox}
          label="Inbox"
          badge={unread}
        />
        <HubRow href="/dashboard/profile" icon={UserCog} label="Profile" />
        <HubRow href="/dashboard/account" icon={Settings} label="Account" />
        {isAdmin && (
          <HubRow href="/admin" icon={ShieldCheck} label="Admin" gold />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Rewrite `src/app/dashboard/layout.tsx`** — desktop greeting+rail (`hidden lg:*`), mobile bar (`lg:hidden`). No `isAdmin` needed here (hub fetches its own data in the page); keep it lean.

```tsx
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/current-user";
import { getUnreadReplyCount } from "@/lib/conversations";
import { Container } from "@/components/brand/layout";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { DashboardMobileBar } from "@/components/dashboard/dashboard-mobile-bar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard");

  const unread = await getUnreadReplyCount();
  const firstName = profile.name.split(" ")[0];

  return (
    <div className="min-h-[70vh] bg-canvas">
      <div className="sticky top-0 z-30 border-b border-border/70 bg-canvas/85 backdrop-blur supports-[backdrop-filter]:bg-canvas/70">
        <Container className="max-w-5xl">
          {/* Desktop: greeting + tab rail */}
          <div className="hidden flex-col gap-4 pb-4 pt-7 lg:flex">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-700">
                Your dashboard
              </p>
              <h1 className="mt-1 font-display text-[26px] font-bold tracking-tight text-ink">
                Hi, {firstName}
              </h1>
            </div>
            <DashboardTabs unread={unread} />
          </div>
          {/* Mobile: greeting on hub root / back link on sub-pages */}
          <div className="flex items-center py-3.5 lg:hidden">
            <DashboardMobileBar firstName={firstName} />
          </div>
        </Container>
      </div>

      <Container className="max-w-5xl pb-12 pt-6 md:pt-8">{children}</Container>
    </div>
  );
}
```

- [ ] **Step 4: Update `src/app/dashboard/page.tsx`** — wrap the existing overview body in `hidden lg:block` and render `DashboardHub` for mobile. Add the imports and `getAdminContext`.

At the top, add imports:
```tsx
import { getAdminContext } from "@/lib/admin";
import { DashboardHub } from "@/components/dashboard/dashboard-hub";
```
Add `getAdminContext()` to the `Promise.all` (or call separately). Simplest — after the existing `const [stats, projects, convos, unreadReplies] = await Promise.all([...])`, add:
```tsx
  const admin = await getAdminContext();
```
Then change the return so the outer wrapper renders the hub (mobile) and the existing content (desktop):
```tsx
  return (
    <>
      <DashboardHub
        posts={stats.projects}
        upvotes={stats.upvotes}
        followers={profile.follower_count}
        unread={unreadReplies}
        isAdmin={!!admin}
      />
      <div className="hidden space-y-8 lg:block">
        {/* …existing At-a-glance / Post something / Recent activity markup unchanged… */}
      </div>
    </>
  );
```
Move the existing `<div className="space-y-8">…</div>` content inside the new `hidden …lg:block` wrapper verbatim.

- [ ] **Step 5: Typecheck.**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit.**

```bash
git add src/components/dashboard/dashboard-mobile-bar.tsx src/components/dashboard/dashboard-hub.tsx src/app/dashboard/layout.tsx src/app/dashboard/page.tsx
git commit -m "Dashboard: Direction-C mobile hub + responsive chrome (desktop rail, mobile bar/back)"
```

---

## Task 3: Rebuild the Account tab (fix overlap, trim, owner-only Admin card)

**Files:**
- Modify: `src/app/dashboard/account/page.tsx`

- [ ] **Step 1: Replace the identity card + add the Admin card.** Rewrite the file so (a) the avatar no longer overlaps the cover banner, (b) the page reads `getAdminContext`, and (c) an owner-only gold Admin card sits just above Sign out.

Add to the imports:
```tsx
import { ShieldCheck } from "lucide-react"; // already imported — keep single import
import { getAdminContext } from "@/lib/admin";
```
In the component, after `const profile = await getCurrentProfile();`, add:
```tsx
  const admin = await getAdminContext();
```
Replace the **Identity card** `<Panel className="overflow-hidden p-0 sm:p-0">…</Panel>` block (the one with the `ACCENT_HERO` cover + `-mt-9` avatar) with this non-overlapping inline version:
```tsx
      {/* Identity — inline, no avatar/banner overlap. */}
      <Panel>
        <div className="flex flex-wrap items-center gap-4">
          <AvatarCircle
            name={profile.name}
            src={profile.avatar_url}
            size={64}
            accent={accent}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-xl font-bold text-ink">
                {profile.name}
              </h3>
              {profile.is_verified ? (
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-gold-50 px-2 py-0.5 text-xs font-semibold text-gold-700"
                  title="Verified"
                >
                  <Sparkle size={13} color="var(--gold-500)" /> Verified
                </span>
              ) : (
                <Pill accent="neutral">Member</Pill>
              )}
            </div>
            <p className="text-sm text-muted-foreground">@{profile.handle}</p>
          </div>
          <Link href="/dashboard/profile" className="btn btn-ghost btn-sm shrink-0">
            <Pencil size={15} /> Edit profile
          </Link>
        </div>
        {profile.bio && (
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {profile.bio}
          </p>
        )}
        <div className="mt-5 grid grid-cols-3 gap-4 border-t border-border pt-5">
          <Stat value={profile.follower_count} label="Followers" />
          <Stat value={joined} label="Joined" />
          <Stat
            value={profile.is_verified ? "Verified" : "Member"}
            label="Status"
          />
        </div>
      </Panel>
```
This removes the `ACCENT_HERO` cover usage. Delete the now-unused `ACCENT_HERO` import (keep `accentFor`). The `ManageLink` to `/settings/profile` targets should be updated to `/dashboard/profile`:
- "Profile & skills" `href="/settings/profile"` → `href="/dashboard/profile"`.
Keep `/settings/notifications`, `/u/${handle}`, `/docs` as-is.

- [ ] **Step 2: Insert the owner-only Admin card** immediately **before** the existing "Sign out" `<Panel>`:
```tsx
      {/* Admin — owner only, kept down by Sign out. */}
      {admin && (
        <Link
          href="/admin"
          className="group flex items-center gap-3.5 rounded-card border border-gold-200 bg-gold-50/60 p-4 transition-colors hover:bg-gold-50"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold-100 text-gold-700">
            <ShieldCheck size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">Admin tools</p>
            <p className="text-xs text-muted-foreground">
              Moderation queues — asks for your passcode.
            </p>
          </div>
          <ChevronRight
            size={16}
            className="shrink-0 text-gold-700/70 transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      )}
```
(`ChevronRight` and `ShieldCheck` are already imported in this file.)

- [ ] **Step 3: Typecheck.**

Run: `npm run typecheck`
Expected: PASS. If "ACCENT_HERO is declared but never read" appears, remove it from the `@/lib/site` import.

- [ ] **Step 4: Commit.**

```bash
git add src/app/dashboard/account/page.tsx
git commit -m "Account tab: inline identity (no avatar/banner overlap) + owner-only Admin card by Sign out"
```

---

## Task 4: Back-button fix

**Files:**
- Modify: `src/components/site/context-bar.tsx`
- Modify: `src/components/brand/back-link.tsx`

- [ ] **Step 1: Lift the show/hide decision into `src/components/site/context-bar.tsx`** so the bar only renders when Back has somewhere real to go. Replace the file with:

```tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Container } from "@/components/brand/layout";
import { BackLink } from "@/components/brand/back-link";

/** Top-level destinations + hubs that never show a Back affordance. */
const NO_BACK = new Set([
  "/",
  "/showcase",
  "/builders",
  "/directory",
  "/gigs",
  "/competitions",
  "/events",
  "/docs",
  "/dashboard",
  "/notifications",
  "/login",
  "/signup",
]);

/** Real section roots a deep-linked sub-page can safely fall back to. */
const SECTION_ROOTS = new Set([
  "/showcase",
  "/builders",
  "/directory",
  "/gigs",
  "/competitions",
  "/events",
  "/docs",
]);

function sectionRoot(path: string): string {
  const parts = path.split("/").filter(Boolean);
  if (parts.length <= 1) return "/";
  parts.pop();
  return "/" + parts.join("/");
}

/** A known-good fallback for this path, or undefined if none. */
function fallbackFor(pathname: string): string | undefined {
  if (pathname.startsWith("/settings/")) return "/dashboard";
  const root = sectionRoot(pathname);
  return SECTION_ROOTS.has(root) ? root : undefined;
}

/** True when there's same-origin in-app history we can safely return to. */
function hasSafeHistory(): boolean {
  if (typeof window === "undefined") return false;
  if (window.history.length <= 1) return false;
  const ref = document.referrer;
  if (!ref) return false;
  try {
    return new URL(ref).origin === window.location.origin;
  } catch {
    return false;
  }
}

export function ContextBar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (NO_BACK.has(pathname) || pathname.startsWith("/dashboard")) return null;

  const fallback = fallbackFor(pathname);
  // Show when there's a real fallback (server-known) or genuine in-app history.
  const show = fallback != null || (mounted && hasSafeHistory());
  if (!show) return null;

  return (
    <div className="border-b border-border/60 bg-canvas/80 backdrop-blur lg:sticky lg:top-0 lg:z-30">
      <Container className="flex h-12 items-center">
        <BackLink fallbackHref={fallback} />
      </Container>
    </div>
  );
}
```

- [ ] **Step 2: Simplify `src/components/brand/back-link.tsx`** to a dumb button (the bar already decided to show it). Keep the history-or-fallback click behavior.

```tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

function sectionRoot(path: string): string {
  const parts = path.split("/").filter(Boolean);
  if (parts.length <= 1) return "/";
  parts.pop();
  return "/" + parts.join("/");
}

function hasSafeHistory(): boolean {
  if (typeof window === "undefined") return false;
  if (window.history.length <= 1) return false;
  const ref = document.referrer;
  if (!ref) return false;
  try {
    return new URL(ref).origin === window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Branded "← Back". Prefers real in-app history; otherwise navigates to an
 * explicit `fallbackHref` (or the section root). Visibility is decided by the
 * caller (e.g. ContextBar), so this always renders its button.
 */
export function BackLink({
  label = "Back",
  fallbackHref,
  className,
}: {
  label?: string;
  fallbackHref?: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function onClick() {
    if (hasSafeHistory()) router.back();
    else router.push(fallbackHref ?? sectionRoot(pathname));
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-teal-800 outline-none transition-colors hover:bg-teal-50 focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  );
}
```

- [ ] **Step 3: Typecheck.**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 4: Commit.**

```bash
git add src/components/site/context-bar.tsx src/components/brand/back-link.tsx
git commit -m "Back button: only show when there's real history or a known-good fallback"
```

---

## Task 5: Recompose the mobile bottom bar

**Files:**
- Modify: `src/components/site/mobile-bottom-nav.tsx`

- [ ] **Step 1: Rewrite the bar to Home · Explore · ＋ · Inbox · You.** "Explore" opens the existing boards sheet (renamed from "More"); "Inbox" → `/dashboard/inbox`; "You" → `/dashboard`. The post FAB stays. Replace the file with:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Inbox,
  User,
  X,
  LayoutGrid,
  Users,
  Briefcase,
  Trophy,
  Calendar,
  HelpCircle,
} from "lucide-react";
import { NAV_LINKS } from "@/lib/site";
import { PostMenu } from "./post-menu";
import { cn } from "@/lib/utils";

const MORE_ICONS: Record<string, typeof LayoutGrid> = {
  "/showcase": LayoutGrid,
  "/builders": Users,
  "/directory": Compass,
  "/gigs": Briefcase,
  "/competitions": Trophy,
  "/events": Calendar,
  "/docs": HelpCircle,
};

/**
 * App-style bottom tab bar for phones + tablets (`lg:hidden`):
 * Home · Explore (boards sheet) · ＋ post · Inbox · You (dashboard).
 */
export function MobileBottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-surface/95 backdrop-blur lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Primary"
      >
        <Tab href="/" label="Home" Icon={Home} active={pathname === "/"} />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 py-2 text-muted-foreground"
          aria-label="Explore"
        >
          <Compass size={20} />
          <span className="text-[11px] font-medium">Explore</span>
        </button>

        <PostMenu variant="fab" />

        <Tab
          href="/dashboard/inbox"
          label="Inbox"
          Icon={Inbox}
          active={isActive("/dashboard/inbox")}
        />
        <Tab
          href="/dashboard"
          label="You"
          Icon={User}
          active={pathname === "/dashboard"}
        />
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/30"
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-border bg-surface p-5 pb-8 shadow-float">
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display text-lg font-semibold text-ink">Explore</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="icon-btn"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {NAV_LINKS.map((l) => {
                const Icon = MORE_ICONS[l.href] ?? Compass;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border px-4 py-3 text-[15px]",
                      isActive(l.href)
                        ? "border-teal-100 bg-teal-50 text-teal-800"
                        : "border-border text-ink hover:bg-secondary",
                    )}
                  >
                    <Icon size={18} className="shrink-0 opacity-80" />
                    {l.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Tab({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 py-2",
        active ? "text-teal-700" : "text-muted-foreground",
      )}
    >
      <Icon size={20} />
      <span className="text-[11px] font-medium">{label}</span>
    </Link>
  );
}
```

- [ ] **Step 2: Typecheck.**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit.**

```bash
git add src/components/site/mobile-bottom-nav.tsx
git commit -m "Mobile bottom bar: Home · Explore · + · Inbox · You (adds Home + dashboard access)"
```

---

## Task 6: Mobile deep-polish pass

**Files:**
- Review/adjust (no new files expected): `src/app/dashboard/posts/page.tsx`, `src/app/dashboard/inbox/page.tsx`, `src/app/dashboard/account/page.tsx`, `src/app/dashboard/profile/page.tsx`, `src/components/dashboard/dashboard-hub.tsx`.

This task is a careful read-through at phone widths (360–414px). For each screen, check and fix only where needed: tap targets ≥44px, no horizontal overflow, `text-` sizes legible, spacing not cramped, safe-area bottom padding clears the bottom bar.

- [ ] **Step 1: Verify global bottom-bar clearance.** Confirm `src/app/layout.tsx` (or the root body) keeps `pb-16 lg:pb-0` (or equivalent) so content clears the fixed bottom bar. If a dashboard sub-page scrolls under the bar, add `pb-20 lg:pb-0` to the dashboard layout's content `Container`. Read `src/app/layout.tsx` first; only change if the padding is missing.

- [ ] **Step 2: Hub + rows spacing check.** Open `dashboard-hub.tsx`; confirm rows are `py-3.5` (≈48px tall — good tap target) and the stat strip doesn't overflow at 360px (3 cols × min content). No change if already correct.

- [ ] **Step 3: Account/Profile at 360px.** Confirm the Account identity row `flex-wrap`s without the "Edit profile" button colliding with the name, and the Profile form inputs are full-width. Adjust only if something overflows.

- [ ] **Step 4: Typecheck.**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit (only if changes were made).**

```bash
git add -A
git commit -m "Mobile polish: tap targets, bottom-bar clearance, no overflow on dashboard screens"
```

---

## Task 7: Integration verification + production admin enablement

**Files:** none (verification + ops).

- [ ] **Step 1: Full build + lint.**

Run: `rm -rf .next && npm run build && npm run lint`
Expected: build completes (OG/dynamic routes may print as `ƒ`); lint clean. If build hits `.next/diagnostics EINVAL`, re-run `rm -rf .next && npm run build` once.

- [ ] **Step 2: Push the branch.**

```bash
git push origin feat/redesign
```
Then watch the Vercel branch preview build.

- [ ] **Step 3: Enable admin in production (owner data).** Set the owner's admin flag via the Supabase MCP (project ref `lqfqkivbxeexmrxuxefi`):
```sql
update profiles set is_admin = true
where id = (select id from auth.users where email = 'elimelechmoster@gmail.com');
```
This makes `getAdminContext()` recognize the owner in production without env vars, so the Account Admin card + mobile hub Admin row appear for them.

- [ ] **Step 4: Set the admin passcode on Vercel (owner-facing).** `ADMIN_PASSCODE` is only in local `.env.local`; production needs it for the `/admin` unlock to work. Either set it via the Vercel integration, or instruct the owner: Vercel → project `yidvibe` → Settings → Environment Variables → add `ADMIN_PASSCODE` = the value from `.env.local` (Production) → redeploy. Until then, `/admin` will show "passcode isn't configured" in prod. Surface this clearly to the owner.

- [ ] **Step 5: Owner visual verification on the preview** (desktop + phone): tab consolidation (no standalone jumps), Profile/Account styling with no overlap, Admin visible only for the owner and passcode-gated, mobile hub + back arrows, recomposed bottom bar, and Back hidden where there's nowhere to go.

---

## Self-Review (completed during planning)

**Spec coverage:**
- Issue 1 (consolidation) → Task 1. ✓
- Issue 2 (Profile/Account rebuild) → Tasks 1 (Profile header) + 3 (Account). ✓
- Issue 3 (owner-only admin + prod) → Task 3 (card) + Task 2 (hub row) + Task 7 (Supabase flag + Vercel passcode). ✓
- Issue 4 (mobile Direction C + bottom bar) → Tasks 2 + 5 + 6. ✓
- Issue 5 (back button) → Task 4. ✓
- Extras (avatar-menu links, Home/dashboard on bottom bar, cramped rail) → Task 1 (links), Task 5 (bottom bar), Task 1/Task 2 (rail desktop-only). ✓

**Placeholder scan:** No TBD/TODO; every code step shows full code or exact string edits.

**Type consistency:** `DashboardHub` props (`posts/upvotes/followers/unread/isAdmin`) match the call site in `page.tsx`. `getAdminContext()` returns `AdminContext | null`; used as `!!admin` everywhere. `BackLink` keeps the same props (`label/fallbackHref/className`) so existing callers (gig thread) still compile.
