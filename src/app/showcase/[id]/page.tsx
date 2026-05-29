import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ExternalLink, Play, Pencil, ArrowRight } from "lucide-react";
import {
  getProjectById,
  getComments,
  getMyUpvotedProjectIds,
} from "@/lib/queries";
import { getCurrentProfile } from "@/lib/current-user";
import { AvatarCircle } from "@/components/brand/avatar-circle";
import { Pill, ToolPill, TagPill } from "@/components/brand/pill";
import { PROJECT_COMMERCIAL } from "@/lib/site";
import { UpvoteButton } from "@/components/brand/upvote-button";
import { AddCommentForm } from "@/components/showcase/add-comment-form";
import { DeleteProjectButton } from "@/components/showcase/delete-project-button";
import { deleteProject } from "@/lib/actions/projects";
import { deleteComment } from "@/lib/actions/comments";
import { formatRelativeTime } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) return { title: "Project not found" };
  return { title: project.name, description: project.description.slice(0, 155) };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const [comments, me, upvoted] = await Promise.all([
    getComments(id),
    getCurrentProfile(),
    getMyUpvotedProjectIds(),
  ]);
  const isAuthed = !!me;
  const isOwner = me?.id === project.owner_id;
  const owner = project.owner;
  const deleteThis = deleteProject.bind(null, id);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <div className="overflow-hidden rounded-card border border-border bg-teal-100">
        <div className="aspect-[16/9] w-full">
          {project.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.image_url}
              alt={project.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-display text-6xl text-teal-600/60">
              {project.name.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {project.images.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {project.images.map((src) => (
            <a
              key={src}
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="block aspect-[4/3] overflow-hidden rounded-card border border-border bg-teal-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </a>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-start justify-between gap-4">
        <h1 className="font-display text-3xl text-ink" dir="auto">
          {project.name}
        </h1>
        <UpvoteButton
          projectId={project.id}
          initialCount={project.upvote_count}
          initialUpvoted={upvoted.has(project.id)}
          isAuthed={isAuthed}
          redirectTo={`/showcase/${id}`}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-teal-600 px-4 text-sm font-medium text-white transition-transform active:scale-[0.98]"
          >
            <ExternalLink size={15} /> Visit live
          </a>
        )}
        {project.video_url && (
          <a
            href={project.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-secondary"
          >
            <Play size={15} /> Watch demo
          </a>
        )}
        {isOwner && (
          <>
            <Link
              href={`/showcase/${id}/edit`}
              className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-border bg-surface px-3 text-sm text-ink transition-colors hover:bg-secondary"
            >
              <Pencil size={15} /> Edit
            </Link>
            <DeleteProjectButton action={deleteThis} />
          </>
        )}
      </div>

      <p
        className="mt-6 whitespace-pre-line text-[15px] leading-relaxed text-ink/90"
        dir="auto"
      >
        {project.description}
      </p>

      {(project.seeking_funding ||
        project.for_sale ||
        project.open_to_partners) && (
        <div className="mt-5 rounded-card border border-border bg-secondary/30 p-4">
          <div className="flex flex-wrap gap-1.5">
            {PROJECT_COMMERCIAL.filter((c) => project[c.key]).map((c) => (
              <Pill key={c.key} accent={c.accent}>
                {c.label}
              </Pill>
            ))}
          </div>
          {!project.is_anonymous && owner && (
            <a
              href={`/u/${owner.handle}#contact`}
              className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-teal-600 px-4 text-sm font-medium text-white transition-transform active:scale-[0.98]"
            >
              Contact the builder
            </a>
          )}
        </div>
      )}

      {(project.tools.length > 0 || project.tags.length > 0) && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {project.tools.map((t) => (
            <ToolPill key={t}>{t}</ToolPill>
          ))}
          {project.tags.map((t) => (
            <TagPill key={t}>{t}</TagPill>
          ))}
        </div>
      )}

      {project.is_anonymous ? (
        <div className="mt-8 rounded-card border border-border bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Built by
          </p>
          <div className="mt-3 flex items-center gap-3">
            <AvatarCircle name="?" src={null} size={44} accent="blue" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ink">Anonymous</p>
              {isOwner && (
                <p className="text-sm text-muted-foreground">
                  Posted anonymously — only you and admins can see it&apos;s
                  yours.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        owner && (
          <div className="mt-8 rounded-card border border-border bg-surface p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Built by
            </p>
            <div className="mt-3 flex items-center gap-3">
              <AvatarCircle
                name={owner.name}
                src={owner.avatar_url}
                size={44}
                accent="blue"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-ink">{owner.name}</p>
                  {owner.available_for_hire && (
                    <Pill accent="sage">Available</Pill>
                  )}
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  @{owner.handle}
                </p>
              </div>
              <Link
                href={`/u/${owner.handle}`}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[10px] bg-teal-600 px-4 text-sm font-medium text-white transition-transform active:scale-[0.98]"
              >
                View profile <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        )
      )}

      <section className="mt-10">
        <h2 className="font-display text-xl text-ink">
          Comments{" "}
          {comments.length > 0 && (
            <span className="text-muted-foreground">({comments.length})</span>
          )}
        </h2>

        <div className="mt-4">
          {isAuthed ? (
            <AddCommentForm projectId={id} />
          ) : (
            <Link
              href={`/login?next=/showcase/${id}`}
              className="inline-flex h-10 items-center rounded-[10px] border border-border bg-surface px-4 text-sm text-ink transition-colors hover:bg-secondary"
            >
              Sign in to comment
            </Link>
          )}
        </div>

        <ul className="mt-6 space-y-5">
          {comments.length === 0 ? (
            <li className="text-sm text-muted-foreground">
              No comments yet — be the first.
            </li>
          ) : (
            comments.map((c) => {
              const del = deleteComment.bind(null, c.id, id);
              const mine = me?.id === c.author_id;
              return (
                <li key={c.id} className="flex gap-3">
                  <AvatarCircle
                    name={c.is_anonymous ? "?" : c.author?.name ?? "?"}
                    src={c.is_anonymous ? null : c.author?.avatar_url}
                    size={32}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {c.is_anonymous ? (
                        <span className="text-sm font-medium text-ink">
                          Anonymous
                        </span>
                      ) : c.author ? (
                        <Link
                          href={`/u/${c.author.handle}`}
                          className="text-sm font-medium text-ink hover:underline"
                        >
                          {c.author.name}
                        </Link>
                      ) : (
                        <span className="text-sm font-medium text-ink">
                          Someone
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(c.created_at)}
                      </span>
                      {mine && (
                        <form action={del} className="ml-auto">
                          <button
                            type="submit"
                            className="text-xs text-muted-foreground transition-colors hover:text-clay-deep"
                          >
                            Delete
                          </button>
                        </form>
                      )}
                    </div>
                    <p
                      className="mt-1 whitespace-pre-line text-sm text-ink/90"
                      dir="auto"
                    >
                      {c.body}
                    </p>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </section>
    </article>
  );
}
