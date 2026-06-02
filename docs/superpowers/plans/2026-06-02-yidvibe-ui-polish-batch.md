# YidVibe UI Polish Batch (A, B, C, E) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the approved UI-polish batch — reshaped/animated upvote button, editorial site-preview frame, auto-dismissing share popup, reorganized profile page + chat button + fixed editor, bold clickable "At a glance" row, a branded page-header component, and a logged-in self-serve directory flow.

**Architecture:** Pure Next.js 15 / React 19 frontend work plus two server actions and (if needed) one RLS migration. Every change reuses the existing brand system — lucide-react icons, `--font-display` serif, brand color tokens, and existing brand primitives. New components are small and focused.

**Tech Stack:** Next.js 15 (App Router, RSC + server actions), React 19, Tailwind v4, Supabase (`@supabase/ssr`), lucide-react ^0.545.0, sonner toasts.

**Spec:** [docs/superpowers/specs/2026-06-02-yidvibe-ui-polish-batch-design.md](../specs/2026-06-02-yidvibe-ui-polish-batch-design.md)

---

## Verification model (read first)

There is **no unit-test runner** in this repo. Each task is verified by:

1. `npm run typecheck` → expect **no errors**.
2. `npm run lint` → expect **no new errors/warnings** in touched files.
3. Visual check: `npm run dev` then open the relevant page. *(OneDrive note: `next dev --turbopack` can be flaky on this OneDrive path; if dev won't start cleanly, fall back to `npm run build` to confirm it compiles, and eyeball the JSX.)*
4. `git add` the touched files and commit with the message shown.

**Non-negotiable brand rules (from the spec):** lucide-react icons only (NO emojis / cheap glyphs), brand `Sparkle` where a spark is needed, `--font-display` for titles/numbers, only brand color tokens, reuse brand primitives (`Panel`, `Pill`, `.btn*`, `ProjectCard`, `AvatarCircle`, `FormSection`, `Container`). If something can't be done the branded way, stop and flag it.

The four areas (A, B, C, E) are independent — they can be implemented and committed in any order, though A→B→C→E is the recommended sequence.

---

## AREA A — Project / site cards

### Task A1: Reshape + re-animate the upvote button

**Files:**
- Modify: `src/app/globals.css` (the `.upvote*` block, ~lines 275–294 and the reduced-motion block ~383–385)
- Modify: `src/components/brand/upvote-button.tsx`
- Modify: `src/app/showcase/[id]/page.tsx` (the right-rail upvote, ~lines 230–256)

- [ ] **Step 1: Replace the `.upvote` CSS block** in `src/app/globals.css`. Find the existing block beginning `.upvote { position: relative; isolation: isolate; ...` and ending at the `.upvote-spark { ... }` rule, and replace all of those `.upvote*` rules with:

```css
/* Rounded-square upvote. Square fill that reaches the corners; snappy + gold sparks. */
.upvote {
  position: relative; isolation: isolate;
  display: inline-flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
  width: 52px; height: 52px;
  border-radius: 16px; border: 1.5px solid var(--border);
  background: var(--surface); color: var(--ink);
  font-family: var(--font-display); font-weight: 700; font-size: 15px; line-height: 1;
  overflow: visible; cursor: pointer;
  transition: background 0s linear 0.25s, border-color 0.12s, transform 0.1s;
}
.upvote svg { position: relative; color: var(--muted); transition: color 0.12s, transform 0.18s; }
.upvote .upvote-num { position: relative; transition: color 0.12s; }
.upvote:hover { border-color: var(--accent); }
.upvote:disabled { opacity: 0.7; cursor: default; }

/* Fill: matches inner radius, rises bottom→top in 250ms. */
.upvote-fill {
  position: absolute; inset: 0; border-radius: 14.5px; background: var(--accent); z-index: -1;
  transform: scaleY(0); transform-origin: bottom;
  transition: transform 0.25s cubic-bezier(0.3, 0.8, 0.3, 1);
}
/* Voted: border + bg go teal (kills white corner slivers); fill completes; text white; count pops. */
.upvote[aria-pressed="true"] { border-color: var(--accent); background: var(--accent); }
.upvote[aria-pressed="true"] .upvote-fill { transform: scaleY(1); }
.upvote[aria-pressed="true"] svg { color: #fff; transform: translateY(-1px); }
.upvote[aria-pressed="true"] .upvote-num { color: #fff; animation: yv-upvote-pop 0.32s ease 0.04s; }

/* Large square for the detail page: stretches to its container's height. */
.upvote-lg { width: 72px; height: auto; align-self: stretch; font-size: 20px; gap: 4px; }

.upvote-sparkles { position: absolute; left: 50%; top: 40%; width: 0; height: 0; z-index: 2; pointer-events: none; }
.upvote-spark {
  position: absolute; left: -3px; top: -3px; width: 6px; height: 6px; border-radius: 999px;
  background: var(--gold-500); opacity: 0;
  animation: yv-spark 0.5s ease-out 0.05s both; /* near-immediate, was 0.5s delay */
}
```

- [ ] **Step 2: Confirm the `yv-upvote-pop` and `yv-spark` keyframes still exist** in `globals.css` (search `@keyframes yv-upvote-pop` and `@keyframes yv-spark`). They are referenced above. If `yv-upvote-pop` does not exist, add it:

```css
@keyframes yv-upvote-pop { 0% { transform: scale(1); } 45% { transform: scale(1.4); } 100% { transform: scale(1); } }
```

- [ ] **Step 3: Verify the reduced-motion block** (~`.upvote-fill { transition: none; }` etc.) still references `.upvote-fill`, `.upvote-spark`, and `.upvote[aria-pressed="true"] .upvote-num`. Leave it as-is — those selectors are unchanged.

- [ ] **Step 4: Update sparkle direction values** in `src/components/brand/upvote-button.tsx` so they fly a bit wider (matches the new size). Replace the `SPARKS` array with:

```tsx
const SPARKS = [
  { dx: "-20px", dy: "-16px" },
  { dx: "20px", dy: "-18px" },
  { dx: "0px", dy: "-26px" },
  { dx: "-14px", dy: "10px" },
  { dx: "16px", dy: "9px" },
];
```

The rest of `upvote-button.tsx` stays the same — it already renders `.upvote-fill`, the `ChevronUp` lucide icon, `.upvote-num`, and the sparkle burst, and toggles `aria-pressed`. The `className` prop still flows through (used for `upvote-lg` below).

- [ ] **Step 5: Swap the detail-page upvote to the large square** in `src/app/showcase/[id]/page.tsx`. The right rail currently has a `<Panel className="space-y-2">` wrapping `<UpvoteButton ... className="upvote-wide" />` then a `<div className="flex flex-col gap-2">` of Visit live / Share. Replace that Panel's inner layout so the upvote sits to the LEFT of the stacked buttons and stretches to their height:

```tsx
<Panel>
  <div className="flex items-stretch gap-3">
    <UpvoteButton
      projectId={project.id}
      initialCount={project.upvote_count}
      initialUpvoted={upvoted.has(project.id)}
      isAuthed={isAuthed}
      redirectTo={`/showcase/${id}`}
      className="upvote-lg"
    />
    <div className="flex flex-1 flex-col justify-center gap-2">
      {project.url && (
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-sm w-full justify-center"
        >
          <ExternalLink size={15} /> Visit live
        </a>
      )}
      <ShareButton
        path={`/showcase/${id}`}
        title={project.name}
        label="Share project"
        className="btn-sm w-full justify-center"
      />
      {project.video_url && (
        <a
          href={project.video_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-sm w-full justify-center"
        >
          <ExternalLink size={15} /> Watch demo
        </a>
      )}
    </div>
  </div>
</Panel>
```

Keep the existing imports (`ExternalLink` is already imported). Preserve any other buttons that were in the original stacked column (e.g. demo/video link) — fold them into the right-hand `flex-col` exactly as above.

- [ ] **Step 6: Remove the `upvote-wide` CSS rule** if present in `globals.css` (search `.upvote-wide`) — it's no longer used. If it's referenced anywhere else, `grep` for `upvote-wide` and remove those usages.

- [ ] **Step 7: Verify** — `npm run typecheck` (no errors), `npm run lint`, then `npm run dev` and open a project card list (`/showcase`) and a project page (`/showcase/<id>`). Click the upvote on both: square shape, fill rises in ~250ms reaching all four corners (no white slivers), gold sparks fire immediately, count pops. On the detail page the square matches the Visit live + Share stack height.

- [ ] **Step 8: Commit**

```bash
git add src/app/globals.css src/components/brand/upvote-button.tsx "src/app/showcase/[id]/page.tsx"
git commit -m "feat(upvote): rounded-square button with snappy gold-spark animation"
```

---

### Task A2: Editorial-float site preview frame

**Files:**
- Modify: `src/components/brand/media-gallery.tsx`

- [ ] **Step 1: Replace the framed return block** in `src/components/brand/media-gallery.tsx` (the `return (...)` that starts with `<div className="overflow-hidden rounded-2xl border border-border bg-surface ...">`). Replace the whole browser-chrome version with the editorial float. Keep the `safeHost`, the `HERO` no-image fallback, and the `all`/`active`/`current`/`host` logic unchanged. New return:

```tsx
  return (
    <div className="rounded-[20px] bg-[linear-gradient(150deg,var(--teal-600),var(--teal-800))] p-5 sm:p-6">
      <div className="overflow-hidden rounded-xl shadow-[0_22px_50px_-16px_rgba(0,0,0,0.55)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current}
          alt={name}
          className="max-h-[460px] w-full bg-white object-contain"
        />
      </div>

      {host && (
        <a
          href={liveUrl ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-bold text-teal-800 shadow-[0_4px_14px_rgba(0,0,0,0.2)] backdrop-blur transition-colors hover:bg-white"
        >
          {host} <ExternalLink size={13} />
        </a>
      )}

      {all.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {all.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                i === active
                  ? "border-white"
                  : "border-white/30 hover:border-white/60",
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

- [ ] **Step 2: Add the `ExternalLink` import** at the top of `media-gallery.tsx`:

```tsx
import { ExternalLink } from "lucide-react";
```

(`cn` and `useState` are already imported.)

- [ ] **Step 3: Verify** — `npm run typecheck`, `npm run lint`, then open a project page with a screenshot. The screenshot floats on a teal mat with a deep shadow, a white URL pill (host + `ExternalLink` icon) sits below it, and the thumbnail strip (if multiple images) sits on the mat with white-bordered active thumb. No browser dots / gray mat remain. The no-image fallback is unchanged.

- [ ] **Step 4: Commit**

```bash
git add src/components/brand/media-gallery.tsx
git commit -m "feat(showcase): editorial-float site preview frame"
```

---

### Task A3: Auto-dismiss the share popup after 20s

**Files:**
- Modify: `src/components/brand/posted-share-card.tsx`

- [ ] **Step 1: Add a 20s auto-dismiss timer + a shrinking progress line.** Replace the body of `PostedShareCard` so it imports `useEffect`, runs a 20s timer that closes the card, and renders a thin bottom progress bar that animates from full to empty over 20s. Full new file:

```tsx
"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Sparkle } from "@/components/brand/sparkle";
import { ShareButton } from "@/components/brand/share-button";

/** Celebratory "you just posted — share it" banner. Auto-dismisses after 20s. */
export function PostedShareCard({
  path,
  title,
  caption,
}: {
  path: string;
  title: string;
  caption: string;
}) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setOpen(false), 20000);
    return () => clearTimeout(t);
  }, []);

  if (!open) return null;

  return (
    <div className="relative mb-5 flex flex-col gap-3 overflow-hidden rounded-2xl border border-sage-mid/40 bg-sage-tint/60 p-4 pr-10 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/70">
          <Sparkle size={20} color="var(--sage-deep)" />
        </span>
        <div>
          <p className="font-semibold text-ink">Posted! Now share it</p>
          <p className="text-sm text-muted-foreground">
            Let the community see what you built.
          </p>
        </div>
      </div>
      <ShareButton
        path={path}
        title={title}
        caption={caption}
        label="Share project"
        className="btn-sm shrink-0"
      />
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Dismiss"
        className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/60"
      >
        <X size={16} />
      </button>
      <span
        aria-hidden
        className="yv-share-progress absolute bottom-0 left-0 h-0.5 bg-sage-mid/70"
      />
    </div>
  );
}
```

- [ ] **Step 2: Add the progress-bar keyframe** to `src/app/globals.css` (anywhere near the other `@keyframes`):

```css
@keyframes yv-share-shrink { from { width: 100%; } to { width: 0%; } }
.yv-share-progress { width: 100%; animation: yv-share-shrink 20s linear forwards; }
@media (prefers-reduced-motion: reduce) { .yv-share-progress { display: none; } }
```

- [ ] **Step 3: Verify** — `npm run typecheck`, `npm run lint`. Post a project (or temporarily render `PostedShareCard` on a page) and confirm: the bottom line shrinks over 20s, the card disappears at 20s, the X still closes it immediately, and Share still works.

- [ ] **Step 4: Commit**

```bash
git add src/components/brand/posted-share-card.tsx src/app/globals.css
git commit -m "feat(share): auto-dismiss posted-share card after 20s with progress line"
```

---

## AREA B — Profile page & editor

### Task B1: Reorganize the public profile (hero + supporting projects)

**Files:**
- Modify: `src/app/u/[handle]/page.tsx`

- [ ] **Step 1: Restructure the page into a full-width hero + two-column body.** Inside the `return (<Container ...>...)`, replace the current `<div className="grid ... lg:grid-cols-[320px_minmax(0,1fr)] ...">` wrapper and its contents with the structure below. This **moves identity into a full-width hero**, keeps About/Tools/Get-in-touch in the left rail, and keeps Projects on the right as a supporting section. Reuse all existing data vars (`profile`, `accent`, `BANNER`, `stats`, `links`, `withOwner`, `isOwner`, `isAuthed`, `following`, `noteCheck`, `joined`, `displayName`, `hasTools`, `hasContact`). Helper components `MiniStat`, `LinkButton` stay.

```tsx
      {/* ── Hero: the profile is the focus ── */}
      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-[var(--shadow-sm)]">
        {profile.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.cover_url} alt="" className="h-32 w-full object-cover sm:h-40" />
        ) : (
          <div className="h-32 sm:h-40" style={{ backgroundImage: BANNER[accent] }} />
        )}
        <div className="px-5 pb-5 sm:px-7">
          <div className="flex flex-wrap items-end gap-4">
            <AvatarCircle
              name={displayName(profile)}
              src={profile.avatar_url}
              size={104}
              accent={accent}
              className="-mt-12 border-4 border-surface shadow-[0_6px_18px_rgba(0,0,0,0.14)]"
            />
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  {displayName(profile)}
                </h1>
                {profile.is_verified && (
                  <span title="Verified"><Sparkle size={20} color="var(--gold-500)" /></span>
                )}
              </div>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {profile.show_real_name !== false && <span>@{profile.handle}</span>}
                {profile.location && (
                  <span className="inline-flex items-center gap-1"><MapPin size={13} /> {profile.location}</span>
                )}
                <span className="inline-flex items-center gap-1.5"><CalendarDays size={13} /> Joined {joined}</span>
                {profile.available_for_hire && <Pill accent="sage">Available for hire</Pill>}
                {profile.hourly_rate != null && <Pill accent="gold">${profile.hourly_rate}/hr</Pill>}
              </p>
            </div>
            <div className="flex items-center gap-2 pb-1">
              {isOwner ? (
                <Link href="/dashboard/profile" className="btn btn-gold btn-sm"><Pencil size={15} /> Edit profile</Link>
              ) : (
                <>
                  <FollowButton
                    builderId={profile.id}
                    initialFollowing={following}
                    isAuthed={isAuthed}
                    redirectTo={`/u/${profile.handle}`}
                  />
                  {isAuthed && <ReportMenu targetType="profile" targetId={profile.id} />}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body: identity details (left) + supporting projects (right) ── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-8">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {profile.bio && (
            <Panel>
              <PanelLabel>About</PanelLabel>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink/90">{profile.bio}</p>
            </Panel>
          )}

          <Panel>
            <PanelLabel>Stats</PanelLabel>
            <div className="mt-3 grid grid-cols-3 gap-2 rounded-2xl border border-border bg-secondary/40 py-3">
              <MiniStat value={stats.projects} label="Projects" />
              <MiniStat value={stats.upvotes} label="Upvotes" />
              <MiniStat value={profile.follower_count} label="Followers" />
            </div>
          </Panel>

          {hasTools && (
            <Panel>
              <PanelLabel>Tools &amp; skills</PanelLabel>
              <div className="mt-3 [&>div]:!mt-0">
                <ToolsSkills tools={profile.tools} skills={profile.skills} />
              </div>
            </Panel>
          )}

          {(hasContact || (!isOwner && isAuthed && noteCheck?.ok)) && (
            <Panel>
              <span id="contact" className="block scroll-mt-24" aria-hidden />
              <PanelLabel>Get in touch</PanelLabel>
              <div className="mt-3 flex flex-col gap-2">
                {!isOwner && isAuthed && noteCheck?.ok && (
                  <NoteButton otherId={profile.id} label="Chat on YidVibe" className="btn-primary w-full justify-center" />
                )}
                <div className="flex flex-wrap items-center gap-2">
                  {links.email && <LinkButton href={contactHref("email", links.email)} variant="primary" icon={<Mail size={15} />}>Email</LinkButton>}
                  {links.phone && <LinkButton href={contactHref("phone", links.phone)} variant="primary" icon={<Phone size={15} />}>Call</LinkButton>}
                  {links.whatsapp && <LinkButton href={contactHref("whatsapp", links.whatsapp)} variant="primary" icon={<MessageCircle size={15} />}>WhatsApp</LinkButton>}
                  {links.instagram && <LinkButton href={contactHref("instagram", links.instagram)} icon={<Instagram size={15} />}>Instagram</LinkButton>}
                  {links.website && <LinkButton href={links.website} icon={<Globe size={15} />}>Website</LinkButton>}
                  {links.github && <LinkButton href={links.github} icon={<Github size={15} />}>GitHub</LinkButton>}
                  {links.x && <LinkButton href={links.x} icon={<Twitter size={15} />}>X</LinkButton>}
                  {links.linkedin && <LinkButton href={links.linkedin} icon={<Linkedin size={15} />}>LinkedIn</LinkButton>}
                </div>
              </div>
            </Panel>
          )}
        </aside>

        <div className="min-w-0">
          <section>
            <div className="flex items-end justify-between gap-3">
              <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">
                {isOwner ? "Your projects" : "Projects"}
              </h2>
              {withOwner.length > 0 && (
                <span className="text-sm font-medium text-muted-foreground">{withOwner.length}</span>
              )}
            </div>
            {withOwner.length === 0 ? (
              <EmptyState
                className="mt-4"
                title={isOwner ? "No projects yet" : "Nothing here yet"}
                description={isOwner ? "Show the community what you've built — your projects appear here automatically." : "This builder hasn't posted a project yet."}
                actionHref={isOwner ? "/showcase/submit" : undefined}
                actionLabel={isOwner ? "Submit a project" : undefined}
              />
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {withOwner.map((p) => (
                  <ProjectCard key={p.id} project={p} isAuthed={isAuthed} upvoted={upvoted.has(p.id)} showBuilder={false} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
```

- [ ] **Step 2: Confirm imports.** All components used above are already imported in the file (`AvatarCircle`, `Pill`, `Panel`, `PanelLabel`, `Sparkle`, `FollowButton`, `ToolsSkills`, `EmptyState`, `ReportMenu`, `NoteButton`, `ProjectCard`, and the lucide icons `MapPin`, `CalendarDays`, `Pencil`, `Mail`, `Phone`, `MessageCircle`, `Instagram`, `Globe`, `Github`, `Twitter`, `Linkedin`). No new imports needed.

- [ ] **Step 3: Verify** — `npm run typecheck`, `npm run lint`, then open your own profile `/u/<handle>` and someone else's. Hero spans full width with overlapping avatar; left rail (About/Stats/Tools/Get-in-touch) aligns at the same top as the Projects column; nothing overlaps; same brand look.

- [ ] **Step 4: Commit**

```bash
git add "src/app/u/[handle]/page.tsx"
git commit -m "feat(profile): full-width hero + supporting projects layout"
```

> Task B2 (chat button) is already folded into the Get-in-touch block above (the `NoteButton` labelled "Chat on YidVibe"). It is committed as part of B1. No separate task needed — but confirm during B1 Step 3 that a logged-in non-owner who can message sees the teal "Chat on YidVibe" button as the first contact option, and the owner does not see it.

---

### Task B3: Fix the profile editor Identity section (cover + overlapping avatar)

**Files:**
- Create: `src/components/profile/cover-avatar-input.tsx`
- Modify: `src/components/profile/profile-form.tsx` (the Identity `FormSection`, ~lines 85–108)

- [ ] **Step 1: Create `src/components/profile/cover-avatar-input.tsx`** — a self-contained client component that renders a full-width cover banner with an overlapping avatar, each uploadable, plus URL paste fields below. It writes the same hidden inputs (`cover_url`, `avatar_url`) the form action reads.

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/image/upload";

/**
 * Identity media picker that mirrors the live profile hero: a full-width cover
 * banner with the avatar overlapping it. Each is click-to-upload or paste-URL.
 * Emits hidden inputs `cover_url` and `avatar_url` for the profile form action.
 */
export function CoverAvatarInput({
  defaultCover,
  defaultAvatar,
  fallbackInitial,
}: {
  defaultCover?: string | null;
  defaultAvatar?: string | null;
  fallbackInitial: string;
}) {
  const [cover, setCover] = useState(defaultCover ?? "");
  const [avatar, setAvatar] = useState(defaultAvatar ?? "");
  const [busy, setBusy] = useState<"cover" | "avatar" | null>(null);
  const coverFile = useRef<HTMLInputElement>(null);
  const avatarFile = useRef<HTMLInputElement>(null);

  async function upload(
    e: React.ChangeEvent<HTMLInputElement>,
    which: "cover" | "avatar",
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(which);
    try {
      const { url, error } = await uploadImage(file, "avatars");
      if (error || !url) {
        toast.error(error ?? "Upload failed.");
        return;
      }
      if (which === "cover") setCover(url);
      else setAvatar(url);
    } finally {
      setBusy(null);
      e.target.value = "";
    }
  }

  return (
    <div>
      <input type="hidden" name="cover_url" value={cover} />
      <input type="hidden" name="avatar_url" value={avatar} />

      {/* cover banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border">
        <div className="h-32 w-full bg-teal-50">
          {cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <button
          type="button"
          onClick={() => coverFile.current?.click()}
          disabled={busy === "cover"}
          className="absolute right-3 top-3 inline-flex h-8 items-center gap-1.5 rounded-[10px] border border-border bg-surface/95 px-3 text-xs font-medium text-ink shadow-[var(--shadow-xs)] backdrop-blur transition-colors hover:bg-secondary disabled:opacity-60"
        >
          {busy === "cover" ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
          {cover ? "Change cover" : "Add cover"}
        </button>
        {cover && (
          <button
            type="button"
            onClick={() => setCover("")}
            aria-label="Remove cover"
            className="absolute left-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-ink/70 text-white"
          >
            <X size={13} />
          </button>
        )}
        <input ref={coverFile} type="file" accept="image/*" className="hidden" onChange={(e) => upload(e, "cover")} />

        {/* overlapping avatar */}
        <div className="absolute -bottom-8 left-5">
          <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-surface bg-teal-50 text-teal-700 shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="grid h-full w-full place-items-center font-display text-2xl">{fallbackInitial}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => avatarFile.current?.click()}
            disabled={busy === "avatar"}
            aria-label="Change photo"
            className="absolute -right-1 bottom-0 grid h-8 w-8 place-items-center rounded-full border border-border bg-surface text-ink shadow-[var(--shadow-sm)] transition-colors hover:bg-secondary disabled:opacity-60"
          >
            {busy === "avatar" ? <Loader2 size={13} className="animate-spin" /> : <Camera size={14} />}
          </button>
          <input ref={avatarFile} type="file" accept="image/*" className="hidden" onChange={(e) => upload(e, "avatar")} />
        </div>
      </div>

      {/* URL paste fields */}
      <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Cover image URL — optional</span>
          <input
            type="url" inputMode="url" value={cover} onChange={(e) => setCover(e.target.value)}
            placeholder="…upload above, or paste an image URL"
            className="h-9 w-full rounded-[10px] border border-border bg-surface px-3 text-sm text-ink outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Profile photo URL</span>
          <input
            type="url" inputMode="url" value={avatar} onChange={(e) => setAvatar(e.target.value)}
            placeholder="…upload above, or paste an image URL"
            className="h-9 w-full rounded-[10px] border border-border bg-surface px-3 text-sm text-ink outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
        </label>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Use it in the Identity section** of `src/components/profile/profile-form.tsx`. Replace the `<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">` block that contains the two `<Field label="Profile photo">` / `<Field label="Cover image">` `ImageInput`s with:

```tsx
        <CoverAvatarInput
          defaultCover={profile.cover_url}
          defaultAvatar={profile.avatar_url}
          fallbackInitial={profile.name.slice(0, 1).toUpperCase()}
        />
```

- [ ] **Step 3: Update imports** in `profile-form.tsx` — add `import { CoverAvatarInput } from "@/components/profile/cover-avatar-input";`. Remove the `ImageInput` import **only if** it's no longer used elsewhere in the file (search `ImageInput` first; if other fields use it, keep the import).

- [ ] **Step 4: Verify** — `npm run typecheck`, `npm run lint`, then open `/dashboard/profile`. The Identity section shows a full-width cover with the avatar overlapping bottom-left; "Change cover" and the avatar camera button upload; the two URL fields below still set the values; nothing overlaps; saving persists `cover_url`/`avatar_url`. Resize to mobile — it stacks cleanly.

- [ ] **Step 5: Commit**

```bash
git add src/components/profile/cover-avatar-input.tsx src/components/profile/profile-form.tsx
git commit -m "fix(profile-editor): cover banner + overlapping avatar Identity layout"
```

---

## AREA C — Dashboard & page headers

### Task C1: Bold, clickable "At a glance" row

**Files:**
- Create: `src/components/dashboard/glance-row.tsx`
- Modify: `src/app/dashboard/page.tsx` (the desktop At-a-glance `Panel`, ~lines 52–67)

- [ ] **Step 1: Create `src/components/dashboard/glance-row.tsx`** — a row of bold teal stat tiles that link to each section and warm to gold on hover.

```tsx
import Link from "next/link";

export type GlanceStat = { value: number; label: string; href: string };

/** Bold, clickable single-row stats. Solid teal, gentle gold wash on hover. */
export function GlanceRow({ stats }: { stats: GlanceStat[] }) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
      {stats.map((s) => (
        <Link
          key={s.label}
          href={s.href}
          className="yv-glance-tile rounded-xl px-2 py-3.5 text-center"
        >
          <div className="font-display text-2xl font-bold leading-none">{s.value}</div>
          <div className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.06em] opacity-90">
            {s.label}
          </div>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Add the tile styling** to `src/app/globals.css`:

```css
.yv-glance-tile {
  display: block; color: #fff;
  background: linear-gradient(140deg, var(--teal-600), var(--teal-800));
  transition: background 0.2s ease, color 0.2s ease;
}
.yv-glance-tile:hover {
  background: linear-gradient(140deg, var(--gold-300), var(--gold-500));
  color: var(--gold-900);
}
```

- [ ] **Step 3: Use it in the dashboard** — in `src/app/dashboard/page.tsx`, replace the At-a-glance `Panel` (the one with `<PanelLabel className="mb-4">At a glance</PanelLabel>` and the `<StatGrid .../>`) with:

```tsx
      {/* At-a-glance — bold, clickable */}
      <section>
        <PanelLabel className="mb-3">At a glance</PanelLabel>
        <GlanceRow
          stats={[
            { value: stats.upvotes, label: "Upvotes", href: "/dashboard/posts" },
            { value: stats.projects, label: "Projects", href: "/dashboard/posts" },
            { value: profile.follower_count, label: "Followers", href: `/u/${profile.handle}` },
            { value: stats.gigs, label: "Gigs", href: "/gigs" },
            { value: stats.competitions, label: "Comps", href: "/competitions" },
            { value: stats.events, label: "Events", href: "/events" },
            { value: stats.saved, label: "Saved", href: "/dashboard/saved" },
            { value: unreadReplies, label: "Unread", href: "/dashboard/inbox" },
          ]}
        />
      </section>
```

- [ ] **Step 4: Update imports** in `dashboard/page.tsx` — add `import { GlanceRow } from "@/components/dashboard/glance-row";`. Remove the `StatGrid` import **if** it's not used elsewhere in the file (search `StatGrid`). `Panel` may still be used by other sections — only remove imports that are now unused.

- [ ] **Step 5: Verify** — `npm run typecheck`, `npm run lint`, then open `/dashboard` on desktop (≥ lg). Eight bold teal tiles in one row; hovering each turns it gold (no lift/shadow pop); clicking navigates (Upvotes/Projects → `/dashboard/posts`, Followers → your profile, Saved → `/dashboard/saved`, Unread → `/dashboard/inbox`, Gigs/Comps/Events → their section pages). Mobile hub is unchanged.

- [ ] **Step 6: Commit**

```bash
git add src/components/dashboard/glance-row.tsx src/app/dashboard/page.tsx src/app/globals.css
git commit -m "feat(dashboard): bold clickable At-a-glance row"
```

---

### Task C2: Branded `PageHeader` component + apply across pages

**Files:**
- Create: `src/components/brand/page-header.tsx`
- Modify: `src/app/showcase/page.tsx`, `src/app/gigs/page.tsx`, `src/app/competitions/page.tsx`, `src/app/events/page.tsx`, `src/app/directory/page.tsx`

- [ ] **Step 1: Create `src/components/brand/page-header.tsx`** (Clean + accent-rule style, per-section accent).

```tsx
import type { ReactNode } from "react";
import type { Accent } from "@/lib/site";
import { cn } from "@/lib/utils";

const ACCENT: Record<Accent, { chip: string; icon: string; rule: string; eyebrow: string }> = {
  teal:   { chip: "bg-teal-50 border-teal-100", icon: "text-teal-700", rule: "border-teal-600", eyebrow: "text-teal-700" },
  gold:   { chip: "bg-gold-50 border-gold-100", icon: "text-gold-700", rule: "border-gold-500", eyebrow: "text-gold-700" },
  sage:   { chip: "bg-sage-bg border-sage-mid/30", icon: "text-sage-deep", rule: "border-sage-mid", eyebrow: "text-sage-deep" },
  clay:   { chip: "bg-clay-bg border-clay-mid/30", icon: "text-clay-deep", rule: "border-clay-mid", eyebrow: "text-clay-deep" },
  blue:   { chip: "bg-blue-bg border-blue-mid/30", icon: "text-blue-deep", rule: "border-blue-mid", eyebrow: "text-blue-deep" },
  orange: { chip: "bg-orange-bg border-orange-mid/30", icon: "text-orange-deep", rule: "border-orange-mid", eyebrow: "text-orange-deep" },
};

/** Consistent branded header: tinted icon chip, eyebrow, serif title, subtitle, accent rule. */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  accent = "teal",
  icon,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  accent?: Accent;
  icon: ReactNode;
  action?: ReactNode;
}) {
  const a = ACCENT[accent];
  return (
    <div className={cn("flex flex-wrap items-end gap-4 border-b-2 pb-4", a.rule)}>
      <span className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-xl border", a.chip, a.icon)}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <div className={cn("text-[10.5px] font-bold uppercase tracking-[0.13em]", a.eyebrow)}>{eyebrow}</div>
        )}
        <h1 className="font-display text-[clamp(1.8rem,4vw,2.4rem)] font-bold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-[15px] text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 pb-1">{action}</div>}
    </div>
  );
}
```

> **Step 1a (only if Tailwind doesn't recognize these tokens):** Tailwind v4 resolves colors from the `@theme` in `globals.css`. Verify classes like `bg-teal-50`, `text-gold-700`, `bg-sage-bg`, `text-clay-deep`, `bg-blue-bg`, `text-orange-deep`, `border-teal-600` actually render (they're used elsewhere in the app — e.g. `text-teal-800`, `bg-sage-tint`, `text-clay-mid` — so most exist). If any class doesn't exist in the theme, use the closest existing token used elsewhere in the codebase rather than inventing one, or apply the color via `style={{ color: "var(--…)" }}`. Do NOT introduce new raw hex.

- [ ] **Step 2: Apply to Showcase** — in `src/app/showcase/page.tsx`, replace the existing header `<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"> ... </div>` (the `<h1>Showcase</h1>` + subtitle + submit button) with:

```tsx
      <PageHeader
        accent="teal"
        eyebrow="Explore"
        icon={<Rocket size={22} />}
        title="Showcase"
        subtitle="Discover what the community is building."
        action={
          <Link href="/showcase/submit" className="btn btn-primary">
            <Plus size={16} /> Submit project
          </Link>
        }
      />
```

Add `import { PageHeader } from "@/components/brand/page-header";` (Rocket, Plus, Link already imported).

- [ ] **Step 3: Apply to the other four list pages.** In each file below, find the page's existing `<h1>`/title header block and replace it with a `PageHeader` using the values in the table. Add the `PageHeader` import and ensure the named lucide icon is imported from `lucide-react`. Keep each page's existing primary action button as the `action` prop (reuse whatever "post/submit" link the page already has; if a page has none, omit `action`).

| File | accent | eyebrow | icon | title | subtitle (use the page's existing subtitle text if present) |
|------|--------|---------|------|-------|----------|
| `src/app/gigs/page.tsx` | `gold` | `Work` | `Briefcase` | `Gigs` | the page's current subtitle (e.g. "Hire or get hired.") |
| `src/app/competitions/page.tsx` | `clay` | `Compete` | `Trophy` | `Competitions` | the page's current subtitle |
| `src/app/events/page.tsx` | `sage` | `Gather` | `Calendar` | `Events` | the page's current subtitle |
| `src/app/directory/page.tsx` | `blue` | `Connect` | `Compass` | `Directory` | the page's current subtitle |

For each: read the file's current header to copy its exact subtitle string and its existing action button, then swap in `PageHeader`. Example for gigs (adjust subtitle/action to what's already there):

```tsx
<PageHeader
  accent="gold"
  eyebrow="Work"
  icon={<Briefcase size={22} />}
  title="Gigs"
  subtitle="Hire or get hired."
  action={/* the page's existing "Post a gig" Link/button, unchanged */}
/>
```

- [ ] **Step 4: Verify** — `npm run typecheck`, `npm run lint`, then open `/showcase`, `/gigs`, `/competitions`, `/events`, `/directory`. Each shows the branded header with the correct per-section accent (teal/gold/clay/sage/blue), the accent rule underline, the lucide icon chip, and the page's action button on the right. Titles use the serif. No emoji anywhere.

- [ ] **Step 5: Commit**

```bash
git add src/components/brand/page-header.tsx src/app/showcase/page.tsx src/app/gigs/page.tsx src/app/competitions/page.tsx src/app/events/page.tsx src/app/directory/page.tsx
git commit -m "feat(nav): branded PageHeader across section pages"
```

---

## AREA E — Self-serve directory listing

### Task E1: Server action + RLS for instant self-listing

**Files:**
- Modify: `src/lib/actions/directory.ts`
- Possibly create: `supabase/migrations/20260602120000_directory_self_listing_policy.sql`

- [ ] **Step 1: Inspect existing RLS** on `directory_listings`. Read the migration that created its policies (search `supabase/migrations/` for `directory_listings` — likely `20260529...` or similar) and note whether an authenticated user may `INSERT` a row with `status = 'approved'` and `submitted_by = auth.uid()`. Also confirm `profiles` allows the owner to `UPDATE is_public`.

- [ ] **Step 2: If (and only if) no policy allows a user to self-insert an approved listing,** create `supabase/migrations/20260602120000_directory_self_listing_policy.sql`:

```sql
-- Allow a signed-in user to insert their OWN directory listing, already approved.
create policy "users insert own approved directory listing"
  on public.directory_listings
  for insert
  to authenticated
  with check (submitted_by = auth.uid() and status = 'approved');
```

Apply it via the project's normal migration path (e.g. the Supabase MCP `apply_migration`, or `supabase db push`). If the existing policies already permit this, skip the migration.

- [ ] **Step 3: Add the `createMyDirectoryListing` action** to `src/lib/actions/directory.ts`. It requires auth, prefills/accepts the form fields, sets `status: "approved"` and `submitted_by: user.id`, optionally flips the profile public, and revalidates.

```tsx
/** Logged-in self-serve: create the current user's own listing, live immediately. */
export async function createMyDirectoryListing(
  _prev: DirectoryListingState,
  formData: FormData,
): Promise<DirectoryListingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to list yourself." };

  const name = String(formData.get("name") ?? "").trim();
  const what = String(formData.get("what_you_do") ?? "").trim();
  const wants = String(formData.get("wants") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const email = String(formData.get("contact_email") ?? "").trim();
  const phone = String(formData.get("contact_phone") ?? "").trim();
  const website = String(formData.get("contact_website") ?? "").trim();
  const logoUrl = String(formData.get("logo_url") ?? "").trim();
  const goPublic = String(formData.get("go_public") ?? "") === "on";

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Your name or business is required.";
  if (!what) fieldErrors.what_you_do = "Tell people what you do.";
  if (!category) fieldErrors.category = "Pick a category.";
  else if (!DIRECTORY_CATEGORIES.includes(category))
    fieldErrors.category = "Pick a category from the list.";
  if (email && !EMAIL_RE.test(email))
    fieldErrors.contact_email = "Enter a valid email address.";
  if (!email && !phone && !website)
    fieldErrors.contact_email = "Add at least one way for people to reach you.";
  if (Object.keys(fieldErrors).length > 0)
    return { error: "Please fix the highlighted fields below.", fieldErrors };

  const contact: Record<string, string> = {};
  if (email) contact.email = email;
  if (phone) contact.phone = phone;
  if (website)
    contact.website = /^https?:\/\//i.test(website) ? website : `https://${website}`;

  const { error } = await supabase.from("directory_listings").insert({
    name: name.slice(0, 120),
    what_you_do: what.slice(0, 600),
    wants: wants ? wants.slice(0, 600) : null,
    category,
    contact,
    logo_url: logoUrl || null,
    status: "approved",
    submitted_by: user.id,
  });
  if (error) return { error: "Couldn't create your listing. Please try again." };

  if (goPublic) {
    await supabase
      .from("profiles")
      .update({ is_public: true, went_public_at: new Date().toISOString() })
      .eq("id", user.id);
  }

  revalidatePath("/directory");
  revalidatePath("/dashboard");
  return { ok: true };
}
```

- [ ] **Step 4: Add a helper to detect an existing listing.** In `src/lib/queries.ts` (the project's query module — confirm path), add:

```tsx
/** The current user's own directory listing, if any. */
export async function getMyDirectoryListing() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("directory_listings")
    .select("id, status, category")
    .eq("submitted_by", user.id)
    .maybeSingle();
  return data ?? null;
}
```

Use whatever `createClient` import the rest of `queries.ts` already uses.

- [ ] **Step 5: Verify** — `npm run typecheck`, `npm run lint`. (Runtime verification happens in E2 once the form exists.)

- [ ] **Step 6: Commit**

```bash
git add src/lib/actions/directory.ts src/lib/queries.ts supabase/migrations/20260602120000_directory_self_listing_policy.sql
git commit -m "feat(directory): self-serve listing action + go-public + own-listing query"
```

(Drop the migration path from `git add` if Step 2 determined it wasn't needed.)

### Task E2: Self-serve form page, prefill, entry points, and logged-out prompt

**Files:**
- Create: `src/app/directory/list-me/page.tsx` (prefilled form, logged-in only)
- Modify: `src/app/dashboard/page.tsx` (entry-point nudge when not listed)
- Modify: `src/app/u/[handle]/page.tsx` (entry-point button on own profile when not listed)
- Modify: `src/app/directory/page.tsx` (logged-out "sign up or submit the form" prompt + logged-in "Add me" button)

- [ ] **Step 1: Create the prefilled self-serve page** `src/app/directory/list-me/page.tsx`. It redirects logged-out users to login, redirects users who already have a listing back to `/directory`, prefills from the profile, and posts to `createMyDirectoryListing`. Use the existing form primitives (`Container`, `FormSection`, `Field`, `PageHeader`, brand inputs) — match the styling of the existing directory apply form (open `src/app/directory/apply/page.tsx` or wherever `createDirectoryListing` is currently used, and mirror its markup). Concrete implementation:

```tsx
import { redirect } from "next/navigation";
import { Compass } from "lucide-react";
import { Container } from "@/components/brand/layout";
import { PageHeader } from "@/components/brand/page-header";
import { getCurrentProfile } from "@/lib/current-user";
import { getMyDirectoryListing } from "@/lib/queries";
import { DIRECTORY_CATEGORIES } from "@/lib/site";
import { SelfListingForm } from "@/components/directory/self-listing-form";

export const metadata = { title: "Get listed in the Directory" };

export default async function ListMePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/directory/list-me");
  const existing = await getMyDirectoryListing();
  if (existing) redirect("/directory");

  const links = (profile.links ?? {}) as Record<string, string | undefined>;
  return (
    <Container className="max-w-2xl py-8 md:py-10">
      <PageHeader
        accent="blue"
        eyebrow="Connect"
        icon={<Compass size={22} />}
        title="Add me to the Directory"
        subtitle="We pulled in what we already know from your profile — just fill the gaps."
      />
      <div className="mt-6">
        <SelfListingForm
          categories={DIRECTORY_CATEGORIES}
          defaults={{
            name: profile.name,
            what_you_do: profile.bio ?? "",
            email: links.email ?? "",
            phone: links.phone ?? "",
            website: links.website ?? "",
            logo_url: profile.avatar_url ?? "",
          }}
        />
      </div>
    </Container>
  );
}
```

- [ ] **Step 2: Create the form client component** `src/components/directory/self-listing-form.tsx`. It uses `useActionState` against `createMyDirectoryListing`, shows prefilled fields with a sage "from profile" check, a required Category select, a go-public switch (default on), and graceful inline field errors (match the existing directory form's error pattern — keep input on error, no native popups). Use lucide `Check`, brand `.btn-primary`. On `state.ok`, show success (e.g. redirect to `/directory` via `useEffect` + `router.push`, or render a success panel with a link). Keep it consistent with the app's existing form components — open the current directory apply form and reuse its `Field`/input styling and error rendering verbatim, adding: the `Check`+"from profile" affordance on prefilled fields, a hidden `logo_url` input, and the `go_public` switch.

(Full markup follows the existing directory apply form one-for-one; the only additions are the prefilled `defaultValue`s passed in via `defaults`, the `logo_url` hidden input, and the `go_public` Radix `Switch` defaulting to checked. Do not invent new styles.)

- [ ] **Step 3: Add the profile entry-point button.** In `src/app/u/[handle]/page.tsx`, when `isOwner` and the owner has no listing, show an "Add me to the Directory" button. Fetch listing status in the page's `Promise.all` (add `getMyDirectoryListing()` to the imports and the parallel fetch, bound by `isOwner`). In the hero action area for the owner, render alongside "Edit profile":

```tsx
{isOwner && !myListing && (
  <Link href="/directory/list-me" className="btn btn-ghost btn-sm">
    <Compass size={15} /> List me in Directory
  </Link>
)}
```

Add `Compass` to the lucide import and `getMyDirectoryListing` to the queries import; compute `const myListing = isOwner ? await getMyDirectoryListing() : null;` (or include in `Promise.all`).

- [ ] **Step 4: Add the dashboard nudge.** In `src/app/dashboard/page.tsx`, fetch `getMyDirectoryListing()` and, when null, render a slim branded card (reuse `Panel`/`.btn`) above or near the actions:

```tsx
{!myDirectoryListing && (
  <Panel className="flex flex-wrap items-center gap-3">
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-bg text-blue-deep">
      <Compass size={18} />
    </span>
    <div className="min-w-0 flex-1">
      <p className="font-medium text-ink">Get listed in the Directory</p>
      <p className="text-sm text-muted-foreground">Let people find and hire you.</p>
    </div>
    <Link href="/directory/list-me" className="btn btn-primary btn-sm shrink-0">Add me</Link>
  </Panel>
)}
```

Add `Compass` to the lucide import, `getMyDirectoryListing` to queries import, and add it to the page's `Promise.all` as `myDirectoryListing`.

- [ ] **Step 5: Update the Directory page CTAs.** In `src/app/directory/page.tsx`, add an authenticated "Add me" entry and a logged-out prompt. Determine auth via the existing `getAuthUser`/`getCurrentProfile` already used in the app. In the `PageHeader` `action` slot (from Task C2) use:

```tsx
action={
  user ? (
    <Link href="/directory/list-me" className="btn btn-primary"><Compass size={16} /> Add me</Link>
  ) : (
    <Link href="/login?next=/directory/list-me" className="btn btn-primary">Sign up to get listed</Link>
  )
}
```

And keep a secondary link to the existing anonymous form for logged-out folks (somewhere visible near the header), e.g.:

```tsx
{!user && (
  <p className="mt-3 text-sm text-muted-foreground">
    Prefer not to sign up?{" "}
    <Link href="/directory/apply" className="font-semibold text-teal-800 hover:underline">Submit the form</Link>{" "}
    and we'll review it.
  </p>
)}
```

(Use the actual path of the existing anonymous submission form in place of `/directory/apply` if it differs.)

- [ ] **Step 6: Make directory cards link to public profiles.** Where the directory list renders each approved listing, if `submitted_by` is set and that profile `is_public`, link the card (or add a "View profile" link) to `/u/<handle>`. This requires the listing query to join/fetch the submitter's handle + is_public. In the directory listing query, select the related profile (`submitted_by`) handle and `is_public`; render the link only when public. (If the current directory query is a plain select, extend it with a secondary fetch of profiles by the set of `submitted_by` ids, then map handle/is_public onto each listing.)

- [ ] **Step 7: Verify end-to-end** — `npm run typecheck`, `npm run lint`, then `npm run dev`:
  - Logged in, not yet listed: dashboard shows the "Get listed" nudge; own profile shows "List me in Directory"; `/directory` header shows "Add me".
  - Click through → `/directory/list-me` form is **prefilled** (name, what-you-do from bio, contact, logo) with only Category empty/required; the go-public switch defaults on.
  - Submit with Category chosen → listing appears in `/directory` immediately; your profile is now public; the card links to `/u/<handle>`. The entry points disappear (you're now listed).
  - Logged out: `/directory` shows "Sign up to get listed" + "Submit the form" link; visiting `/directory/list-me` redirects to login.

- [ ] **Step 8: Commit**

```bash
git add src/app/directory/list-me/page.tsx src/components/directory/self-listing-form.tsx src/app/dashboard/page.tsx "src/app/u/[handle]/page.tsx" src/app/directory/page.tsx
git commit -m "feat(directory): logged-in self-serve listing with prefill, go-public, and entry points"
```

---

## Final verification (after all tasks)

- [ ] `npm run typecheck` — clean.
- [ ] `npm run lint` — clean on all touched files.
- [ ] `npm run build` — compiles successfully.
- [ ] Visual sweep: showcase card + detail (upvote, frame), post→share auto-dismiss, profile (hero, chat, projects), profile editor (cover/avatar), dashboard (glance row), section pages (headers), directory (self-serve + logged-out). No emojis or off-brand colors anywhere.
- [ ] Confirm spec coverage: A1 upvote ✓, A2 frame ✓, A3 share ✓, B1 profile ✓, B2 chat ✓, B3 editor ✓, C1 glance ✓, C2 header ✓, E1/E2 directory ✓.
