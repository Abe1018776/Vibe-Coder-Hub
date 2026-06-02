# YidVibe UI Wave 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Ship the wave-2 UI: card spacing/equal-height, profile avatar fix, soft-inset site frame, header v2 (no icon) + inner-page breadcrumb, landing reorg (rotating Top Projects + Top Creators), unified admin-managed browse-by tags, builders ranking + medals, and contextual help links.

**Architecture:** Next.js 15 / React 19 frontend, a few new client components, one new `tags` table + admin slice, and small query/action additions. Everything reuses the existing brand system.

**Tech stack:** Next 15 (RSC + server actions), React 19, Tailwind v4, Supabase (`@supabase/ssr`), lucide-react.

**Spec:** [docs/superpowers/specs/2026-06-02-yidvibe-ui-wave2-design.md](../specs/2026-06-02-yidvibe-ui-wave2-design.md)

---

## Verification model (read first)
No unit-test runner exists. **Do NOT run `npm run lint`** (broken — it hangs in an interactive wizard). Verify each task with **`npm run typecheck`** (must be clean) and, where noted, **`npm run build`** (if it fails with `EINVAL readlink .next/diagnostics`, run `rm -rf .next` and rebuild — OneDrive artifact). Commit after each task. Do NOT push (controller pushes at the end).

**Brand rules:** lucide-react icons only (NO emojis), `--font-display` serif, brand tokens only, reuse brand primitives. The placeholder emojis in mockups must never ship.

Tasks are ordered to avoid file conflicts; run them **sequentially** in this order: A → B → C → D → E → F.

---

## Task A: Quick fixes — site frame + avatar cut-off

**Files:** `src/components/brand/media-gallery.tsx`, `src/components/profile/cover-avatar-input.tsx`

- [ ] **Step 1 — Site frame "soft inset".** In `media-gallery.tsx`, replace the current framed `return (...)` (the teal-gradient "editorial float" block with the floating URL pill) with this. Keep `safeHost`, the `HERO` no-image fallback, props, and the `all`/`active`/`current`/`host` logic. Remove the now-unused `host`/`ExternalLink` only if they become unused (host is no longer displayed — if `safeHost`/`host` become unused, delete them and the `ExternalLink` import to keep typecheck clean):

```tsx
  return (
    <div className="rounded-2xl border border-border bg-secondary/60 p-2 shadow-[0_10px_30px_-14px_rgba(16,32,43,0.28)]">
      <div className="overflow-hidden rounded-[10px] border border-teal-600/60 bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current}
          alt={name}
          className="max-h-[460px] w-full bg-white object-contain"
        />
      </div>

      {all.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto p-1">
          {all.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "h-14 w-20 shrink-0 overflow-hidden rounded-lg border transition-colors",
                i === active ? "border-teal-600 ring-2 ring-teal-600/30" : "border-border hover:border-border-hover",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full bg-white object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
```

(If `host`/`liveUrl`/`safeHost` are now unused, remove them and the `ExternalLink` import. `liveUrl` is still a prop — keep the prop, just don't render it.)

- [ ] **Step 2 — Avatar cut-off.** In `cover-avatar-input.tsx`, the avatar (`-bottom-8`) is clipped by the cover's `overflow-hidden`. Restructure so only the **cover image** clips, not the avatar. Change the outer cover container from `relative overflow-hidden rounded-2xl border` to a non-clipping wrapper, and move `overflow-hidden` onto an inner image div. Concretely: wrap the colored cover area in its own `overflow-hidden rounded-2xl` div, keep the "Change cover"/remove buttons positioned over it, and keep the avatar block as a sibling inside the outer `relative` wrapper (which must NOT have `overflow-hidden`). Add `pb-10` to the outer wrapper so the overhanging avatar has room. Verify visually the avatar is fully round and not cut at the bottom.

- [ ] **Step 3 — Verify & commit.** `npm run typecheck` clean.
```
git add src/components/brand/media-gallery.tsx src/components/profile/cover-avatar-input.tsx
git commit -m "fix(ui): soft-inset site frame + unclipped editor avatar"
```

---

## Task B: Header v2 (no icon) + inner-page breadcrumb

**Files:** `page-header.tsx`, new `section-crumb.tsx`, `showcase/page.tsx`, `gigs/page.tsx`, `competitions/page.tsx`, `events/page.tsx`, `directory/page.tsx`, `builders/page.tsx`, and detail pages `showcase/[id]/page.tsx`, `gigs/[slug]/page.tsx`, `competitions/[slug]/page.tsx`.

- [ ] **Step 1 — PageHeader drops the icon.** Edit `src/components/brand/page-header.tsx`: remove the icon `<span>` chip entirely. Make the `icon` prop optional and unused (or remove it). New body:

```tsx
  const a = ACCENT[accent];
  return (
    <div className="border-b-2 pb-4" style={{ borderBottomColor: a.rule }}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && (
            <div className="text-[10.5px] font-bold uppercase tracking-[0.13em]" style={{ color: a.fg }}>{eyebrow}</div>
          )}
          <h1 className="font-display text-[clamp(1.8rem,4vw,2.4rem)] font-bold tracking-tight text-ink">{title}</h1>
          {subtitle && <p className="mt-1 text-[15px] text-muted-foreground">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0 pb-1">{action}</div>}
      </div>
    </div>
  );
```
Keep the `ACCENT` map and `Accent` import. Remove `icon` from the props type (and `ReactNode` import if now unused — only `action` still needs it, so keep `ReactNode`).

- [ ] **Step 2 — Remove `icon` props from call sites.** In `showcase/page.tsx`, `gigs/page.tsx`, `competitions/page.tsx`, `events/page.tsx`, `directory/page.tsx`, delete the `icon={...}` prop passed to `PageHeader`. Then remove any lucide icon import that becomes unused as a result (check each — e.g. if `Rocket`/`Briefcase`/`Trophy`/`Calendar`/`Compass` was only used for the header chip; many are also used by `EmptyState`, so verify before removing).

- [ ] **Step 3 — Builders gets PageHeader.** In `src/app/builders/page.tsx`, replace the hand-rolled `<Eyebrow>The people behind it</Eyebrow>` + `<h1>Builders</h1>` + subtitle `<p>` with:
```tsx
      <PageHeader
        accent="blue"
        eyebrow="The people behind it"
        title="Builders"
        subtitle="Meet the people shipping AI apps and tools in the community."
      />
```
Add `import { PageHeader } from "@/components/brand/page-header";`. Remove the now-unused `Eyebrow` import if nothing else uses it.

- [ ] **Step 4 — SectionCrumb component.** Create `src/components/brand/section-crumb.tsx`:
```tsx
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Accent } from "@/lib/site";

const FG: Record<Accent, string> = {
  teal: "var(--teal-700)", gold: "var(--gold-700)", sage: "var(--sage-deep)",
  clay: "var(--clay-deep)", blue: "var(--blue-deep)", orange: "var(--orange-deep)",
};

/** Slim branded breadcrumb for inner/detail pages: ‹ Section / Name */
export function SectionCrumb({
  section, href, name, accent = "teal",
}: { section: string; href: string; name?: string; accent?: Accent }) {
  return (
    <div className="mb-5 flex items-center gap-2 border-b border-border pb-3 text-[13px]">
      <Link href={href} className="inline-flex items-center gap-1.5 font-bold" style={{ color: FG[accent] }}>
        <ChevronLeft size={14} /> {section}
      </Link>
      {name && (<><span className="text-border">/</span><span className="truncate text-muted-foreground">{name}</span></>)}
    </div>
  );
}
```

- [ ] **Step 5 — Add crumbs to detail pages.** Near the top of the main content in:
  - `src/app/showcase/[id]/page.tsx` → `<SectionCrumb section="Showcase" href="/showcase" name={project.name} accent="teal" />`
  - `src/app/gigs/[slug]/page.tsx` → `<SectionCrumb section="Gigs" href="/gigs" name={gig.title} accent="gold" />` (use the gig's real title field)
  - `src/app/competitions/[slug]/page.tsx` → `<SectionCrumb section="Competitions" href="/competitions" name={competition.title} accent="clay" />` (use the real field)
  Add the import to each. Place it just inside the page's `Container`, before the existing content. Read each file to use the correct entity variable + title field.

- [ ] **Step 6 — Verify & commit.** `npm run typecheck` clean; `npm run build` (clear `.next` if needed) green.
```
git add src/components/brand/page-header.tsx src/components/brand/section-crumb.tsx src/app/showcase/page.tsx src/app/gigs/page.tsx src/app/competitions/page.tsx src/app/events/page.tsx src/app/directory/page.tsx src/app/builders/page.tsx "src/app/showcase/[id]/page.tsx" "src/app/gigs/[slug]/page.tsx" "src/app/competitions/[slug]/page.tsx"
git commit -m "feat(nav): header v2 (no icon) + Builders header + inner-page breadcrumbs"
```

---

## Task C: Card spacing + medals + builders ranking

**Files:** `globals.css`, `project-card.tsx`, `builder-card.tsx`, `builders/page.tsx`, `showcase/page.tsx`, `gigs/page.tsx`, `lib/queries.ts`.

- [ ] **Step 1 — Medal/ring CSS.** In `src/app/globals.css` add:
```css
/* Rank medals + ring (builders, top project/gig) */
.yv-ring-gold { box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--gold-500); }
.yv-medal { position: absolute; right: -3px; bottom: -3px; display: grid; place-items: center; width: 22px; height: 22px; border-radius: 999px; border: 2px solid #fff; color: #fff; font-size: 11px; font-weight: 800; line-height: 1; }
.yv-medal-1 { background: var(--gold-500); } .yv-medal-2 { background: #9aa3ab; } .yv-medal-3 { background: #c08457; }
.yv-medal-chip { display: inline-flex; align-items: center; gap: 5px; background: var(--gold-500); color: #fff; font-size: 10.5px; font-weight: 800; padding: 4px 9px; border-radius: 999px; }
```

- [ ] **Step 2 — Card spacing.** In `project-card.tsx`, ensure the root card has `h-full` (so it fills grid cells). In `globals.css`, give `.pc-body` a touch more padding if it reads cramped (e.g. keep `padding: 18px` but increase the gap above tags/foot). In `src/app/showcase/page.tsx` change the projects grid gap `gap-5` → `gap-6`. (Landing grids are handled in Task E.)

- [ ] **Step 3 — ProjectCard medal prop.** Add an optional `topRank?: boolean` prop to `ProjectCard`. When true, render a medal chip on the cover (inside `.pc-cover`, top-left, near the existing flag): 
```tsx
{topRank && (
  <span className="pc-flag yv-medal-chip" style={{ top: 12, left: 12 }}>
    <Medal size={12} /> #1 most upvoted
  </span>
)}
```
Import `Medal` from lucide-react. Make sure it doesn't collide with the existing `pc-flag` (featured/live) — if a featured/live flag is already shown, place the medal chip on the opposite corner (top-right under the SaveButton) or stack it; keep it clean.

- [ ] **Step 4 — BuilderCard rank.** Read `src/components/brand/builder-card.tsx`. Add an optional `rank?: 1 | 2 | 3` prop. When set, wrap the avatar in a `relative` span and add the ring (`yv-ring-gold` for rank 1) + a `.yv-medal .yv-medal-{rank}` badge showing the rank number. Keep the card otherwise unchanged.

- [ ] **Step 5 — Builders sorted by followers + ranks.** In `src/lib/queries.ts`, make `listBuilders` support `sort: "followers"` ordering by `follower_count` desc (and add it as the default the Builders page uses). In `src/app/builders/page.tsx`, pass `sort: "followers"`, and when there are **no active filters and `page === 1`**, pass `rank={i + 1}` to the first three `BuilderCard`s (i.e. `rank={i < 3 ? ((i + 1) as 1|2|3) : undefined}`).

- [ ] **Step 6 — Top project/gig medal.** In `src/app/showcase/page.tsx`, when not filtering and on page 1, compute the top project = the first item of the default `sort: "top"` list (most upvoted). Pass `topRank={p.id === topId}` to the matching `ProjectCard`. Do the equivalent on `src/app/gigs/page.tsx` for the gig card (mark the first gig in the default order with the medal — reuse the gig card's existing structure; add a small `yv-medal-chip` with `<Medal size={12}/> #1`). Read both pages to wire correctly; only the single #1 gets it.

- [ ] **Step 7 — Verify & commit.** `npm run typecheck` clean; `npm run build` green.
```
git add src/app/globals.css src/components/brand/project-card.tsx src/components/brand/builder-card.tsx src/app/builders/page.tsx src/app/showcase/page.tsx src/app/gigs/page.tsx src/lib/queries.ts
git commit -m "feat(ranking): builders by followers, top-3 medals + ring, #1 project/gig medal, card spacing"
```

---

## Task D: Unified browse-by tags + admin tag manager

**Files:** new migration, `lib/queries.ts`, new `browse-by.tsx`, new `admin/tags/page.tsx`, tag actions in `lib/actions/admin.ts`, project form action, `admin/page.tsx`, `globals.css`.

- [ ] **Step 1 — Migration file.** Create `supabase/migrations/20260602130000_tags.sql`:
```sql
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  slug text not null unique,
  is_hidden boolean not null default false,
  source text not null default 'auto',
  created_at timestamptz not null default now()
);
alter table public.tags enable row level security;
create policy "tags public read" on public.tags for select to anon, authenticated using (is_hidden = false);
create policy "tags admin all" on public.tags for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
```
(Confirm the admin-check pattern matches existing policies — read another admin RLS policy in `supabase/migrations/` and mirror its exact `is_admin` predicate.) The controller applies this migration via Supabase MCP after the file exists.

- [ ] **Step 2 — Tag helpers + queries.** Add to `src/lib/queries.ts`:
```tsx
export function normalizeTag(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, " ");
}

/** All visible browse-by tags (labels), for the marquee. */
export async function getBrowseTags(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("tags").select("label").eq("is_hidden", false).order("label");
  return (data ?? []).map((t) => t.label as string);
}
```

- [ ] **Step 3 — Auto-feed on project save.** In the project create/update server action (find it — search `from("projects").insert` / `.update` in `src/lib/actions/`), after a successful save, upsert each tag: for each `tag` in the project's tags, `await supabase.from("tags").upsert({ label: tag.trim(), slug: normalizeTag(tag), source: "auto" }, { onConflict: "slug", ignoreDuplicates: true });`. Import `normalizeTag`. Wrap in a try/`Promise.all`; failures here must not break project save.

- [ ] **Step 4 — Admin tag actions.** Add to `src/lib/actions/admin.ts`:
```tsx
export async function addTag(formData: FormData) {
  await requireAdminUnlocked();
  const label = String(formData.get("label") ?? "").trim();
  if (!label) return;
  const supabase = await createClient();
  await supabase.from("tags").upsert(
    { label, slug: label.trim().toLowerCase().replace(/\s+/g, " "), source: "admin", is_hidden: false },
    { onConflict: "slug" },
  );
  revalidatePath("/admin/tags"); revalidatePath("/");
}

export async function removeTag(id: string) {
  await requireAdminUnlocked();
  const supabase = await createClient();
  await supabase.from("tags").delete().eq("id", id);
  revalidatePath("/admin/tags"); revalidatePath("/");
}
```
(`requireAdminUnlocked`, `createClient`, `revalidatePath` are already imported in that file.)

- [ ] **Step 5 — Admin tags page.** Create `src/app/admin/tags/page.tsx` (mirror the existing admin sub-page style, e.g. `admin/directory/page.tsx`): `await requireAdminUnlocked()`, fetch all tags (`select *` ordered by label), render an "Add tag" form (`<form action={addTag}>` with a text input + submit) and the list of tags as chips, each with a `<form action={removeTag.bind(null, t.id)}>` submit button (× / `Trash2` icon). Brand-styled (`.btn`, chips). Add `import { addTag, removeTag } from "@/lib/actions/admin";`.

- [ ] **Step 6 — Admin dashboard link.** In `src/app/admin/page.tsx`, add a card linking to `/admin/tags` (lucide `Tag` or `Hash` icon, "Browse-by tags", short description) matching the existing card grid.

- [ ] **Step 7 — BrowseBy component + marquee CSS.** Create `src/components/brand/browse-by.tsx`:
```tsx
import Link from "next/link";

/** Centered "Browse by" label + one slow auto-scrolling row of all tags. */
export function BrowseBy({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  const loop = [...tags, ...tags];
  return (
    <div>
      <div className="mb-3 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-teal-800">Browse by</div>
      <div className="yv-marquee">
        <div className="yv-marquee-track">
          {loop.map((t, i) => (
            <Link key={`${t}-${i}`} href={`/showcase?tag=${encodeURIComponent(t)}`} className="yv-tag">{t}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}
```
Add to `globals.css`:
```css
.yv-marquee { position: relative; overflow: hidden; -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent); mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent); }
.yv-marquee-track { display: flex; gap: 9px; width: max-content; animation: yv-marquee-scroll 80s linear infinite; }
.yv-marquee:hover .yv-marquee-track { animation-play-state: paused; }
@keyframes yv-marquee-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.yv-tag { white-space: nowrap; border: 1px solid var(--border); background: var(--surface); color: var(--ink); border-radius: 999px; padding: 7px 14px; font-size: 13.5px; transition: border-color .15s, background .15s, color .15s; }
.yv-tag:hover { border-color: var(--accent); background: var(--teal-50); color: var(--teal-800); }
@media (prefers-reduced-motion: reduce) { .yv-marquee-track { animation: none; flex-wrap: wrap; } }
```

- [ ] **Step 8 — Verify & commit.** `npm run typecheck` clean. (BrowseBy is wired into the landing in Task E.)
```
git add supabase/migrations/20260602130000_tags.sql src/lib/queries.ts src/lib/actions/admin.ts src/app/admin/tags/page.tsx src/app/admin/page.tsx src/components/brand/browse-by.tsx src/app/globals.css <project-form-action-file>
git commit -m "feat(tags): unified tags table, browse-by marquee, admin tag manager"
```

---

## Task E: Landing page reorg (rotating Top Projects + Top Creators)

**Files:** new `rotating-row.tsx`, `src/app/page.tsx`, `lib/queries.ts` (top builders), `globals.css`.

- [ ] **Step 1 — RotatingRow component.** Create `src/components/brand/rotating-row.tsx` (client) — an auto-advancing horizontal carousel:
```tsx
"use client";
import { useEffect, useRef, useState } from "react";

/** Auto-advancing row of cards. Pauses on hover; static under reduced-motion. */
export function RotatingRow({ children }: { children: React.ReactNode[] }) {
  const items = Array.isArray(children) ? children : [children];
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 4500);
    return () => clearInterval(t);
  }, [paused, items.length]);

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="overflow-hidden">
        <div
          ref={trackRef}
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${idx * 100}%)` }}
        >
          {items.map((c, i) => (
            <div key={i} className="w-full shrink-0 px-1 sm:w-1/2 lg:w-1/3">{c}</div>
          ))}
        </div>
      </div>
      {items.length > 1 && (
        <div className="mt-4 flex justify-center gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to ${i + 1}`}
              onClick={() => setIdx(i)}
              className={i === idx ? "h-1.5 w-4 rounded-full bg-teal-600" : "h-1.5 w-1.5 rounded-full bg-border"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```
*(This translates one item-width per tick; with 1/3-width items it advances one card at a time and loops. Acceptable, simple, robust.)*

- [ ] **Step 2 — Top builders query.** In `src/lib/queries.ts` add `listTopBuilders(limit = 5)` returning builders ordered by `follower_count desc` (reuse the builder shape returned by `listBuilders`). 

- [ ] **Step 3 — Landing reorg.** In `src/app/page.tsx`:
  - Update the data fetch: `listProjects({ sort: "top", limit: 5 })`, add `listTopBuilders(5)` and `getBrowseTags()` to the `Promise.all`.
  - **Remove** the entire "Everything you need" `<Section>` and the `FEATURES` array. Remove the old "Category chips" block and the `CATEGORIES` array.
  - After the hero, render `<Container className="pt-10"><BrowseBy tags={tags} /></Container>`.
  - Add a **Top Projects** `<Section>`: heading "Top Projects" (serif) + a `<RotatingRow>` of project preview cards (style B: screenshot cover + footer bar with name linking to `project.url || /showcase/${id}` and a small square upvote count). Build a small local `TopProjectCard` (or inline) using the existing cover image markup from `ProjectCard` (`pc-cover`/`pc-shot`) for consistency. Under it, a "Browse projects →" `link-arrow` to `/showcase`.
  - Add a **Top Creators** `<Section>`: heading "Top Creators" + a `<RotatingRow>` of creator tiles (style A: `AvatarCircle` with `yv-ring-gold` on index 0, a `.yv-medal .yv-medal-{n}` on the first 3, name linking to `/u/${handle}`, followers with lucide `Users`). Under it, a "Browse builders →" link to `/builders`.
  - Keep "There's a place for you here" and "Ready to vibe?".
  - Import `BrowseBy`, `RotatingRow`, `AvatarCircle`, `Users`, `Medal`, `displayName`.

- [ ] **Step 4 — Verify & commit.** `npm run typecheck` clean; `npm run build` green.
```
git add src/components/brand/rotating-row.tsx src/app/page.tsx src/lib/queries.ts src/app/globals.css
git commit -m "feat(landing): reorg with rotating Top Projects + Top Creators, browse-by"
```

---

## Task F: Contextual "How it works" links on post forms

**Files:** new `form-help-link.tsx`, the post-form pages/components.

- [ ] **Step 1 — Component.** Create `src/components/brand/form-help-link.tsx`:
```tsx
import Link from "next/link";
import { HelpCircle } from "lucide-react";

/** Clean, non-gatekeepy help link under a post form. */
export function FormHelpLink({ children, href = "/docs" }: { children: React.ReactNode; href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-800 hover:underline">
      <HelpCircle size={15} /> {children}
    </Link>
  );
}
```

- [ ] **Step 2 — Add to each post form.** Add a `FormHelpLink` near the top (under the form's intro/heading) of: project submit (`src/app/showcase/submit` form), gig post (`src/app/gigs/post`), competition post (`src/app/competitions/post`), event post/request (`src/app/events/post` and/or `/events/request`), and the directory forms (`/directory/list` and `/directory/list-me`). Find each form's intro area and insert, with a context label, e.g.:
  - Project: `<FormHelpLink>New here? See how posting a project works →</FormHelpLink>`
  - Gig: `…how gigs work →`; Competition: `…how competitions work →`; Event: `…how events work →`; Directory: `…how the directory works →`.
  Keep tone clean (no "you post and we decide"). All link to `/docs`.

- [ ] **Step 3 — Verify & commit.** `npm run typecheck` clean.
```
git add src/components/brand/form-help-link.tsx <the post form files touched>
git commit -m "feat(forms): contextual how-it-works links under post forms"
```

---

## Final gate (controller)
- [ ] Apply the `tags` migration to the live DB via Supabase MCP `apply_migration`.
- [ ] `npm run typecheck` clean; `npm run build` green (clear `.next` if EINVAL).
- [ ] Push `main` → production. Confirm Vercel deployment READY.
- [ ] Spec coverage check: 1A/1B/1C ✓, 2A/2B/2C ✓, 3 ✓, 4A/4B/4C ✓, 5A/5B/5C ✓, help links ✓.
