import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ExternalLink, Play, Pencil, ArrowRight, ArrowLeft } from "lucide-react";
import {
  getProjectById,
  getComments,
  getMyUpvotedProjectIds,
} from "@/lib/queries";
import { getCurrentProfile } from "@/lib/current-user";
import { getAdminContext } from "@/lib/admin";
import { Container } from "@/components/brand/layout";
import { Sparkle } from "@/components/brand/sparkle";
import { AvatarCircle } from "@/components/brand/avatar-circle";
import { Pill, ToolPill, TagPill } from "@/components/brand/pill";
import { PROJECT_COMMERCIAL } from "@/lib/site";
import { UpvoteButton } from "@/components/brand/upvote-button";
import { AddCommentForm } from "@/components/showcase/add-comment-form";
import { InterestButton } from "@/components/showcase/interest-button";
import { ReportMenu } from "@/components/brand/report-menu";
import { DeleteProjectButton } from "@/components/showcase/delete-project-button";
import { FeatureToggle } from "@/components/admin/feature-toggle";
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

  const [comments, me, upvoted, admin] = await Promise.all([
    getComments(id),
    getCurrentProfile(),
    getMyUpvotedProjectIds(),
    getAdminContext(),
  ]);
  const isAuthed = !!me;
  const isOwner = me?.id === project.owner_id;
  const owner = project.owner;
  const deleteThis = deleteProject.bind(null, id);

  return (
    <Container className="max-w-3xl py-10">
      <Link
        href="/showcase"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-teal-800"
      >
        <ArrowLeft size={15} /> Back to Showcase
      </Link>

      <div className="relative mt-5 aspect-[16/8] overflow-hidden rounded-3xl border border-border bg-teal-50">
        {project.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.image_url}
            alt={project.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center">
            <Sparkle
              size={24}
              color="var(--teal-400)"
              style={{ position: "absolute", top: 16, right: 16, opacity: 0.7 }}
            />
            <span className="font-display text-6xl font-bold text-teal-700">
              {project.name.slice(0, 1).toUpperCase()}
            </span>
          </div>
        )}
        {project.featured ? (
          <span className="pc-flag">
            <Sparkle size={12} color="var(--gold-900)" /> Featured
          </span>
        ) : project.url ? (
          <span className="pc-flag is-live">
            <span className="dot yv-live-dot" /> Live
          </span>
        ) : null}
      </div>

      {project.images.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {project.images.map((src) => (
            <a
              key={src}
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="block aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-teal-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </a>
          ))}
        </div>
      )}

      <div className="mt-7 flex items-start justify-between gap-4">
        <h1
          className="font-display text-[clamp(1.8rem,4vw,2.75rem)] font-bold tracking-tight text-ink"
          dir="auto"
        >
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

      {(project.tools.length > 0 || project.tags.length > 0) && (
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {project.tools.map((t) => (
            <ToolPill key={t}>{t}</ToolPill>
          ))}
          {project.tags.map((t) => (
            <TagPill key={t}>{t}</TagPill>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
          >
            <ExternalLink size={15} /> Visit live
          </a>
        )}
        {project.video_url && (
          <a
            href={project.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm"
          >
            <Play size={15} /> Watch demo
          </a>
        )}
        {isOwner && (
          <>
            <Link href={`/showcase/${id}/edit`} className="btn btn-ghost btn-sm">
              <Pencil size={15} /> Edit
            </Link>
            <DeleteProjectButton action={deleteThis} />
          </>
        )}
        {admin && (
          <FeatureToggle projectId={id} featured={!!project.featured} />
        )}
        {isAuthed && !isOwner && (
          <div className="ml-auto flex items-center">
            <ReportMenu targetType="project" targetId={id} />
          </div>
        )}
      </div>

      <p
        className="mt-6 whitespace-pre-line text-[17px] leading-relaxed text-ink/90"
        dir="auto"
      >
        {project.description}
      </p>

      {(project.seeking_funding ||
        project.for_sale ||
        project.open_to_partners) && (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
          <div className="flex flex-wrap gap-1.5">
            {PROJECT_COMMERCIAL.filter((c) => project[c.key]).map((c) => (
              <Pill key={c.key} accent={c.accent}>
                {c.label}
              </Pill>
            ))}
          </div>
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            {!project.is_anonymous && owner && (
              <a href={`/u/${owner.handle}#contact`} className="btn btn-primary btn-sm">
                Contact the builder
              </a>
            )}
            {isAuthed && !isOwner && <InterestButton projectId={id} />}
            {!isAuthed && (
              <Link href={`/login?next=/showcase/${id}`} className="btn btn-ghost btn-sm">
                Sign in to connect
              </Link>
            )}
          </div>
        </div>
      )}

      {project.is_anonymous ? (
        <BuiltByCard>
          <AvatarCircle name="?" src={null} size={44} accent="blue" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink">Anonymous</p>
            {isOwner && (
              <p className="text-sm text-muted-foreground">
                Posted anonymously — only you and admins can see it&apos;s yours.
              </p>
            )}
          </div>
        </BuiltByCard>
      ) : (
        owner && (
          <BuiltByCard>
            <AvatarCircle name={owner.name} src={owner.avatar_url} size={44} accent="blue" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-semibold text-ink">{owner.name}</p>
                {owner.available_for_hire && <Pill accent="sage">Available</Pill>}
              </div>
              <p className="truncate text-sm text-muted-foreground">
                @{owner.handle}
              </p>
            </div>
            <Link href={`/u/${owner.handle}`} className="btn btn-ghost btn-sm shrink-0">
              View profile <ArrowRight size={15} />
            </Link>
          </BuiltByCard>
        )
      )}

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-ink">
          Comments{" "}
          {comments.length > 0 && (
            <span className="text-muted-foreground">({comments.length})</span>
          )}
        </h2>

        <div className="mt-4">
          {isAuthed ? (
            <AddCommentForm projectId={id} />
          ) : (
            <Link href={`/login?next=/showcase/${id}`} className="btn btn-ghost btn-sm">
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
                        <span className="text-sm font-semibold text-ink">
                          Anonymous
                        </span>
                      ) : c.author ? (
                        <Link
                          href={`/u/${c.author.handle}`}
                          className="text-sm font-semibold text-ink hover:underline"
                        >
                          {c.author.name}
                        </Link>
                      ) : (
                        <span className="text-sm font-semibold text-ink">
                          Someone
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(c.created_at)}
                      </span>
                      {mine ? (
                        <form action={del} className="ml-auto">
                          <button
                            type="submit"
                            className="text-xs text-muted-foreground transition-colors hover:text-clay-deep"
                          >
                            Delete
                          </button>
                        </form>
                      ) : (
                        isAuthed && (
                          <div className="ml-auto">
                            <ReportMenu targetType="comment" targetId={c.id} />
                          </div>
                        )
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
    </Container>
  );
}

function BuiltByCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-8 rounded-2xl border border-border bg-surface p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Built by
      </p>
      <div className="mt-3.5 flex items-center gap-3">{children}</div>
    </div>
  );
}
