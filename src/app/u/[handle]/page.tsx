import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Globe,
  Github,
  Twitter,
  Linkedin,
  Pencil,
  MapPin,
  Mail,
  Phone,
  MessageCircle,
  Instagram,
} from "lucide-react";
import { contactHref } from "@/lib/site";
import {
  getProfileByHandle,
  getProjectsByOwner,
  getMyUpvotedProjectIds,
  type ProjectWithOwner,
} from "@/lib/queries";
import { getCurrentProfile } from "@/lib/current-user";
import { AvatarCircle } from "@/components/brand/avatar-circle";
import { ProjectCard } from "@/components/brand/project-card";
import { Pill, ToolPill, TagPill } from "@/components/brand/pill";
import { EmptyState } from "@/components/brand/empty-state";
import { ReportMenu } from "@/components/brand/report-menu";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const profile = await getProfileByHandle(handle);
  if (!profile) return { title: "Builder not found" };
  return {
    title: profile.name,
    description: profile.bio ?? `${profile.name} — builder on YidVibe`,
  };
}

function LinkButton({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-border bg-surface px-3 text-sm text-ink transition-colors hover:bg-secondary"
    >
      {icon}
      {children}
    </a>
  );
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const profile = await getProfileByHandle(handle);
  if (!profile) notFound();

  const [projects, me, upvoted] = await Promise.all([
    getProjectsByOwner(profile.id),
    getCurrentProfile(),
    getMyUpvotedProjectIds(),
  ]);

  const isOwner = me?.id === profile.id;
  const isAuthed = !!me;
  const links = (profile.links ?? {}) as Record<string, string | undefined>;

  const owner = {
    handle: profile.handle,
    name: profile.name,
    avatar_url: profile.avatar_url,
    available_for_hire: profile.available_for_hire,
  };
  // Don't deanonymize: a visitor must not see projects this person posted anonymously.
  const visible = isOwner ? projects : projects.filter((p) => !p.is_anonymous);
  const withOwner: ProjectWithOwner[] = visible.map((p) => ({ ...p, owner }));

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-10 md:px-6">
      <header className="rounded-card border border-border bg-surface p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <AvatarCircle
              name={profile.name}
              src={profile.avatar_url}
              size={72}
              accent="blue"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl text-ink">{profile.name}</h1>
                {profile.available_for_hire && (
                  <Pill accent="sage">Available for hire</Pill>
                )}
              </div>
              <p className="text-sm text-muted-foreground">@{profile.handle}</p>
              {profile.location && (
                <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin size={14} /> {profile.location}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {profile.hourly_rate != null && (
              <span className="text-sm font-medium text-ink">
                ${profile.hourly_rate}
                <span className="text-muted-foreground">/hr</span>
              </span>
            )}
            {isOwner ? (
              <Link
                href="/settings/profile"
                className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-secondary"
              >
                <Pencil size={15} /> Edit profile
              </Link>
            ) : (
              isAuthed && <ReportMenu targetType="profile" targetId={profile.id} />
            )}
          </div>
        </div>

        {profile.bio && (
          <p className="mt-5 max-w-2xl whitespace-pre-line text-[15px] leading-relaxed text-ink/90">
            {profile.bio}
          </p>
        )}

        {(profile.tools.length > 0 || profile.skills.length > 0) && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {profile.tools.map((t) => (
              <ToolPill key={t}>{t}</ToolPill>
            ))}
            {profile.skills.map((s) => (
              <TagPill key={s}>{s}</TagPill>
            ))}
          </div>
        )}

        {(links.email ||
          links.phone ||
          links.whatsapp ||
          links.instagram ||
          links.website ||
          links.github ||
          links.x ||
          links.linkedin) && (
          <div
            id="contact"
            className="mt-5 flex scroll-mt-20 flex-wrap items-center gap-2.5"
          >
            {links.email && (
              <LinkButton href={contactHref("email", links.email)} icon={<Mail size={15} />}>
                Email
              </LinkButton>
            )}
            {links.phone && (
              <LinkButton href={contactHref("phone", links.phone)} icon={<Phone size={15} />}>
                Call
              </LinkButton>
            )}
            {links.whatsapp && (
              <LinkButton href={contactHref("whatsapp", links.whatsapp)} icon={<MessageCircle size={15} />}>
                WhatsApp
              </LinkButton>
            )}
            {links.instagram && (
              <LinkButton href={contactHref("instagram", links.instagram)} icon={<Instagram size={15} />}>
                Instagram
              </LinkButton>
            )}
            {links.website && (
              <LinkButton href={links.website} icon={<Globe size={15} />}>
                Website
              </LinkButton>
            )}
            {links.github && (
              <LinkButton href={links.github} icon={<Github size={15} />}>
                GitHub
              </LinkButton>
            )}
            {links.x && (
              <LinkButton href={links.x} icon={<Twitter size={15} />}>
                X
              </LinkButton>
            )}
            {links.linkedin && (
              <LinkButton href={links.linkedin} icon={<Linkedin size={15} />}>
                LinkedIn
              </LinkButton>
            )}
          </div>
        )}
      </header>

      <section className="mt-8">
        <h2 className="font-display text-xl text-ink">
          {isOwner ? "Your projects" : "Projects"}
        </h2>
        {withOwner.length === 0 ? (
          <EmptyState
            className="mt-4"
            title={isOwner ? "No projects yet" : "Nothing here yet"}
            description={
              isOwner
                ? "Show the community what you've built — your projects appear here automatically."
                : "This builder hasn't posted a project yet."
            }
            actionHref={isOwner ? "/showcase/submit" : undefined}
            actionLabel={isOwner ? "Submit a project" : undefined}
          />
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {withOwner.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                isAuthed={isAuthed}
                upvoted={upvoted.has(p.id)}
                showBuilder={false}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
