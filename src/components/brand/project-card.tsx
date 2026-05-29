import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AvatarCircle } from "./avatar-circle";
import { ToolPill, TagPill, Pill } from "./pill";
import { UpvoteButton } from "./upvote-button";
import { PROJECT_COMMERCIAL } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { ProjectWithOwner } from "@/lib/queries";

export function ProjectCard({
  project,
  isAuthed,
  upvoted,
  highlight = false,
  showBuilder = true,
}: {
  project: ProjectWithOwner;
  isAuthed: boolean;
  upvoted: boolean;
  highlight?: boolean;
  showBuilder?: boolean;
}) {
  const owner = project.owner;
  const href = `/showcase/${project.id}`;

  return (
    <div
      className={cn(
        "group flex flex-col overflow-hidden rounded-card border bg-surface transition-colors",
        highlight
          ? "border-teal-600 ring-1 ring-teal-600/15"
          : "border-border hover:border-border-hover",
      )}
    >
      <Link href={href} className="block">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-teal-100">
          {project.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.image_url}
              alt={project.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-display text-4xl text-teal-600/60">
              {project.name.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={href}
            className="font-medium leading-snug text-ink hover:text-teal-800"
          >
            {project.name}
          </Link>
          <UpvoteButton
            projectId={project.id}
            initialCount={project.upvote_count}
            initialUpvoted={upvoted}
            isAuthed={isAuthed}
            topRanked={highlight}
            redirectTo={href}
          />
        </div>

        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
          {project.description}
        </p>

        {(project.seeking_funding ||
          project.for_sale ||
          project.open_to_partners) && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PROJECT_COMMERCIAL.filter((c) => project[c.key]).map((c) => (
              <Pill key={c.key} accent={c.accent}>
                {c.label}
              </Pill>
            ))}
          </div>
        )}

        {(project.url || project.tools.length > 0 || project.tags.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.url && <Pill accent="sage">Live</Pill>}
            {project.tools.slice(0, 3).map((t) => (
              <ToolPill key={t}>{t}</ToolPill>
            ))}
            {project.tags.slice(0, 2).map((t) => (
              <TagPill key={t}>{t}</TagPill>
            ))}
          </div>
        )}

        {showBuilder &&
          (project.is_anonymous ? (
            <div className="mt-auto flex items-center gap-2 border-t border-border pt-3">
              <AvatarCircle name="?" src={null} size={24} />
              <span className="truncate text-sm text-muted-foreground">
                by <span className="text-ink">Anonymous</span>
              </span>
            </div>
          ) : (
            owner && (
              <Link
                href={`/u/${owner.handle}`}
                className="mt-auto flex items-center gap-2 rounded-md border-t border-border pt-3"
              >
                <AvatarCircle name={owner.name} src={owner.avatar_url} size={24} />
                <span className="truncate text-sm text-muted-foreground">
                  by <span className="text-ink">{owner.name}</span>
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
