import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ExternalLink, Play, Pencil, ArrowRight } from "lucide-react";
import {
  getProjectById,
  getComments,
  getMyUpvotedProjectIds,
  getMySavedProjectIds,
} from "@/lib/queries";
import { getCurrentProfile } from "@/lib/current-user";
import { getAdminContext } from "@/lib/admin";
import { Container } from "@/components/brand/layout";
import { Sparkle } from "@/components/brand/sparkle";
import { AvatarCircle } from "@/components/brand/avatar-circle";
import { Pill } from "@/components/brand/pill";
import { Panel, PanelLabel } from "@/components/brand/panel";
import { MediaGallery } from "@/components/brand/media-gallery";
import { CommentsCard } from "@/components/showcase/comments-card";
import { PROJECT_COMMERCIAL, accentFor, ACCENT_HERO } from "@/lib/site";
import { UpvoteButton } from "@/components/brand/upvote-button";
import { SaveButton } from "@/components/brand/save-button";
import { ShareButton } from "@/components/brand/share-button";
import { InterestButton } from "@/components/showcase/interest-button";
import { ReportMenu } from "@/components/brand/report-menu";
import { DeleteProjectButton } from "@/components/showcase/delete-project-button";
import { FeatureToggle } from "@/components/admin/feature-toggle";
import { deleteProject } from "@/lib/actions/projects";
import { cn } from "@/lib/utils";

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

function DetailRow({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/60 py-2 text-sm last:border-0">
      <span className="shrink-0 font-medium text-muted-foreground">{k}</span>
      <span className="flex flex-wrap justify-end gap-1.5 text-right text-ink">
        {children}
      </span>
    </div>
  );
}

function ChipLink({
  href,
  tone,
  children,
}: {
  href: string;
  tone: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", tone)}
    >
      {children}
    </Link>
  );
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const [comments, me, upvoted, saved, admin] = await Promise.all([
    getComments(id),
    getCurrentProfile(),
    getMyUpvotedProjectIds(),
    getMySavedProjectIds(),
    getAdminContext(),
  ]);
  const isAuthed = !!me;
  const isOwner = me?.id === project.owner_id;
  const owner = project.owner;
  const accent = accentFor(project.name);
  const deleteThis = deleteProject.bind(null, id);

  const postedDate = new Date(project.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const badge = project.featured ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-tint px-2.5 py-0.5 text-xs font-semibold text-gold-deep">
      <Sparkle size={12} color="var(--gold-500)" /> Featured
    </span>
  ) : project.url ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-tint px-2.5 py-0.5 text-xs font-semibold text-sage-deep">
      <span className="yv-live-dot h-1.5 w-1.5 rounded-full bg-sage-deep" /> Live
    </span>
  ) : null;

  const hasCommercial =
    project.seeking_funding || project.for_sale || project.open_to_partners;

  return (
    <Container className="max-w-6xl py-8">
      {/* Full-width header — both columns start below this */}
      <header className="flex flex-wrap items-start gap-3.5 border-b border-border pb-5">
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl font-display text-lg font-bold text-white"
          style={{ backgroundImage: ACCENT_HERO[accent] }}
        >
          {project.name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1
              className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl"
              dir="auto"
            >
              {project.name}
            </h1>
            {badge}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {project.is_anonymous || !owner ? (
              "by Anonymous"
            ) : (
              <>
                by{" "}
                <Link
                  href={`/u/${owner.handle}`}
                  className="font-medium text-ink hover:underline"
                >
                  {owner.name}
                </Link>
              </>
            )}
            {" · posted "}
            {postedDate}
          </p>
        </div>
        <SaveButton
          projectId={id}
          initialSaved={saved.has(id)}
          isAuthed={isAuthed}
          redirectTo={`/showcase/${id}`}
        />
      </header>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.7fr_1fr] lg:items-start">
        {/* LEFT */}
        <div className="space-y-5">
          <MediaGallery
            name={project.name}
            coverImage={project.image_url}
            images={project.images}
            liveUrl={project.url}
            accent={accent}
          />

          <Panel>
            <PanelLabel>About this project</PanelLabel>
            <p
              className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink/90"
              dir="auto"
            >
              {project.description}
            </p>
          </Panel>

          {hasCommercial && (
            <Panel>
              <PanelLabel>Looking for</PanelLabel>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {PROJECT_COMMERCIAL.filter((c) => project[c.key]).map((c) => (
                  <Pill key={c.key} accent={c.accent}>
                    {c.label}
                  </Pill>
                ))}
              </div>
              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                {!project.is_anonymous && owner && (
                  <a
                    href={`/u/${owner.handle}#contact`}
                    className="btn btn-primary btn-sm"
                  >
                    Contact the builder
                  </a>
                )}
                {isAuthed && !isOwner && <InterestButton projectId={id} />}
                {!isAuthed && (
                  <Link
                    href={`/login?next=/showcase/${id}`}
                    className="btn btn-ghost btn-sm"
                  >
                    Sign in to connect
                  </Link>
                )}
              </div>
            </Panel>
          )}
        </div>

        {/* RIGHT rail */}
        <div className="space-y-4 lg:sticky lg:top-16">
          <Panel className="space-y-3.5">
            <div className="flex justify-center">
              <UpvoteButton
                projectId={project.id}
                initialCount={project.upvote_count}
                initialUpvoted={upvoted.has(project.id)}
                isAuthed={isAuthed}
                redirectTo={`/showcase/${id}`}
              />
            </div>
            <div className="flex flex-col gap-2">
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
                  <Play size={15} /> Watch demo
                </a>
              )}
              {isOwner && (
                <>
                  <Link
                    href={`/showcase/${id}/edit`}
                    className="btn btn-ghost btn-sm w-full justify-center"
                  >
                    <Pencil size={15} /> Edit
                  </Link>
                  <DeleteProjectButton action={deleteThis} />
                </>
              )}
              {admin && <FeatureToggle projectId={id} featured={!!project.featured} />}
              {isAuthed && !isOwner && (
                <div className="flex justify-center pt-0.5">
                  <ReportMenu targetType="project" targetId={id} />
                </div>
              )}
            </div>
          </Panel>

          <Panel>
            <PanelLabel>Built by</PanelLabel>
            {project.is_anonymous || !owner ? (
              <div className="mt-3 flex items-center gap-3">
                <AvatarCircle name="?" src={null} size={40} accent="blue" />
                <div className="min-w-0">
                  <p className="font-semibold text-ink">Anonymous</p>
                  {isOwner && (
                    <p className="text-xs text-muted-foreground">
                      Only you and admins can see it&apos;s yours.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-3">
                <AvatarCircle
                  name={owner.name}
                  src={owner.avatar_url}
                  size={40}
                  accent="blue"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-ink">{owner.name}</p>
                    {owner.available_for_hire && <Pill accent="sage">Available</Pill>}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    @{owner.handle}
                  </p>
                </div>
                <Link
                  href={`/u/${owner.handle}`}
                  className="btn btn-ghost btn-sm shrink-0"
                >
                  View <ArrowRight size={15} />
                </Link>
              </div>
            )}
          </Panel>

          <Panel>
            <PanelLabel>Details</PanelLabel>
            <div className="mt-2">
              {project.tools.length > 0 && (
                <DetailRow k="Built with">
                  {project.tools.map((t) => (
                    <ChipLink
                      key={t}
                      href={`/showcase?tool=${encodeURIComponent(t)}`}
                      tone="bg-blue-tint text-blue-deep"
                    >
                      {t}
                    </ChipLink>
                  ))}
                </DetailRow>
              )}
              {project.tags.length > 0 && (
                <DetailRow k="Topics">
                  {project.tags.map((t) => (
                    <ChipLink
                      key={t}
                      href={`/showcase?tag=${encodeURIComponent(t)}`}
                      tone="bg-teal-50 text-teal-800"
                    >
                      {t}
                    </ChipLink>
                  ))}
                </DetailRow>
              )}
              <DetailRow k="Posted">{postedDate}</DetailRow>
              <DetailRow k="Status">
                {project.featured ? "Featured" : project.url ? "Live" : "Listed"}
              </DetailRow>
            </div>
          </Panel>

          <CommentsCard
            projectId={id}
            comments={comments}
            meId={me?.id ?? null}
            isAuthed={isAuthed}
          />
        </div>
      </div>
    </Container>
  );
}
