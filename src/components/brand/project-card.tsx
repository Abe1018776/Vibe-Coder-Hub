import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AvatarCircle } from "./avatar-circle";
import { TagPill, Pill } from "./pill";
import { UpvoteButton } from "./upvote-button";
import { SaveButton } from "./save-button";
import { Sparkle } from "./sparkle";
import { PROJECT_COMMERCIAL, accentFor, type Accent } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { ProjectWithOwner } from "@/lib/queries";

/** Soft branded cover tints, keyed to the project's stable accent. */
const COVER: Record<Accent, { bg: string; fg: string }> = {
  teal: { bg: "var(--teal-50)", fg: "var(--teal-700)" },
  blue: { bg: "var(--blue-bg)", fg: "var(--blue-deep)" },
  orange: { bg: "var(--orange-bg)", fg: "var(--orange-deep)" },
  clay: { bg: "var(--clay-bg)", fg: "var(--clay-deep)" },
  sage: { bg: "var(--sage-bg)", fg: "var(--sage-deep)" },
  gold: { bg: "var(--gold-50)", fg: "var(--gold-700)" },
};

export function ProjectCard({
  project,
  isAuthed,
  upvoted,
  saved = false,
  highlight = false,
  showBuilder = true,
}: {
  project: ProjectWithOwner;
  isAuthed: boolean;
  upvoted: boolean;
  saved?: boolean;
  highlight?: boolean;
  showBuilder?: boolean;
}) {
  const owner = project.owner;
  const href = `/showcase/${project.id}`;
  const featured = !!project.featured;
  const cover = COVER[accentFor(project.name)];
  const initial = project.name.slice(0, 1).toUpperCase();

  return (
    <div
      className={cn(
        "project-card group relative",
        featured ? "is-featured" : highlight && "is-top",
      )}
    >
      <SaveButton
        projectId={project.id}
        initialSaved={saved}
        isAuthed={isAuthed}
        redirectTo={href}
        className="absolute right-3 top-3 z-10"
      />

      <Link href={href} className="block">
        <div className="pc-cover" style={{ background: cover.bg }}>
          {project.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.image_url} alt={project.name} className="pc-shot" />
          ) : (
            <span className="pc-initial" style={{ color: cover.fg }}>
              {initial}
            </span>
          )}

          {featured ? (
            <span className="pc-flag">
              <Sparkle size={12} color="var(--gold-900)" /> Featured
            </span>
          ) : project.url ? (
            <span className="pc-flag is-live">
              <span className="dot yv-live-dot" /> Live
            </span>
          ) : null}

          {project.tools.length > 0 && (
            <div className="pc-tools">
              {project.tools.slice(0, 2).map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>

      <div className="pc-body">
        <div className="flex items-start justify-between gap-3">
          <Link href={href} className="pc-title leading-snug">
            {project.name}
          </Link>
          <UpvoteButton
            projectId={project.id}
            initialCount={project.upvote_count}
            initialUpvoted={upvoted}
            isAuthed={isAuthed}
            redirectTo={href}
          />
        </div>

        <p className="pc-desc">{project.description}</p>

        {(project.for_sale || project.open_to_partners) && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {PROJECT_COMMERCIAL.filter((c) => project[c.key]).map((c) => (
              <Pill key={c.key} accent={c.accent}>
                {c.label}
              </Pill>
            ))}
          </div>
        )}

        {project.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.tags.slice(0, 3).map((t) => (
              <TagPill key={t} href={`/showcase?tag=${encodeURIComponent(t)}`}>
                {t}
              </TagPill>
            ))}
          </div>
        )}

        {showBuilder &&
          (project.is_anonymous ? (
            <div className="pc-foot">
              <AvatarCircle name="?" src={null} size={24} />
              <span className="truncate">
                by <strong>Anonymous</strong>
              </span>
            </div>
          ) : (
            owner && (
              <Link href={`/u/${owner.handle}`} className="pc-foot">
                <AvatarCircle name={owner.name} src={owner.avatar_url} size={24} />
                <span className="truncate">
                  by <strong>{owner.name}</strong>
                </span>
                {owner.available_for_hire && (
                  <Pill accent="sage" className="ml-0.5">
                    Available
                  </Pill>
                )}
                <ArrowRight
                  size={15}
                  className="ml-auto shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            )
          ))}
      </div>
    </div>
  );
}
