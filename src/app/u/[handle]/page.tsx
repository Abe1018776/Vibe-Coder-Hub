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
import { contactHref, accentFor, type Accent } from "@/lib/site";
import {
  getProfileByHandle,
  getProjectsByOwner,
  getMyUpvotedProjectIds,
  getProfileStats,
  isFollowing,
  type ProjectWithOwner,
} from "@/lib/queries";
import { getCurrentProfile } from "@/lib/current-user";
import { Container } from "@/components/brand/layout";
import { AvatarCircle } from "@/components/brand/avatar-circle";
import { ProjectCard } from "@/components/brand/project-card";
import { Pill } from "@/components/brand/pill";
import { Sparkle } from "@/components/brand/sparkle";
import { FollowButton } from "@/components/brand/follow-button";
import { ToolsSkills } from "@/components/profile/tools-skills";
import { EmptyState } from "@/components/brand/empty-state";
import { ReportMenu } from "@/components/brand/report-menu";
import { NoteButton } from "@/components/messaging/note-button";
import { canMessage } from "@/lib/conversations";

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

const BANNER: Record<Accent, string> = {
  teal: "linear-gradient(135deg, var(--teal-50) 0%, var(--teal-400) 100%)",
  blue: "linear-gradient(135deg, var(--blue-bg) 0%, var(--blue-mid) 100%)",
  orange: "linear-gradient(135deg, var(--orange-bg) 0%, var(--orange-mid) 100%)",
  clay: "linear-gradient(135deg, var(--clay-bg) 0%, var(--clay-mid) 100%)",
  sage: "linear-gradient(135deg, var(--sage-bg) 0%, var(--sage-mid) 100%)",
  gold: "linear-gradient(135deg, var(--gold-50) 0%, var(--gold-500) 100%)",
};

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div>
      <div className="font-display text-xl font-bold leading-none text-ink">
        {value}
      </div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
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
      className="btn btn-ghost btn-sm"
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

  const [projects, me, upvoted, stats, following] = await Promise.all([
    getProjectsByOwner(profile.id),
    getCurrentProfile(),
    getMyUpvotedProjectIds(),
    getProfileStats(profile.id),
    isFollowing(profile.id),
  ]);

  const isOwner = me?.id === profile.id;
  const isAuthed = !!me;
  const noteCheck = !isOwner && isAuthed ? await canMessage(profile) : null;
  // Private accounts have no public profile page until they go public.
  if (!profile.is_public && !isOwner) notFound();
  const links = (profile.links ?? {}) as Record<string, string | undefined>;
  const accent = accentFor(profile.handle);
  const joined = new Date(profile.created_at).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });

  const owner = {
    handle: profile.handle,
    name: profile.name,
    avatar_url: profile.avatar_url,
    available_for_hire: profile.available_for_hire,
  };
  // Don't deanonymize: a visitor must not see projects this person posted anonymously.
  const visible = isOwner ? projects : projects.filter((p) => !p.is_anonymous);
  const withOwner: ProjectWithOwner[] = visible.map((p) => ({ ...p, owner }));

  const hasContact =
    links.email ||
    links.phone ||
    links.whatsapp ||
    links.instagram ||
    links.website ||
    links.github ||
    links.x ||
    links.linkedin;

  return (
    <Container className="py-8 md:py-12">
      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-[var(--shadow-sm)]">
        {profile.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.cover_url}
            alt=""
            className="h-20 w-full object-cover sm:h-24"
          />
        ) : (
          <div
            className="h-20 sm:h-24"
            style={{ backgroundImage: BANNER[accent] }}
          />
        )}

        <div className="px-5 pb-6 md:px-8 md:pb-8">
          <div className="flex flex-wrap items-start gap-4 pt-4">
            <AvatarCircle
              name={profile.name}
              src={profile.avatar_url}
              size={80}
              accent={accent}
              className="shadow-[0_2px_12px_rgba(0,0,0,0.12)]"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  {profile.name}
                </h1>
                {profile.is_verified && (
                  <span title="Verified">
                    <Sparkle size={20} color="var(--gold-500)" />
                  </span>
                )}
                {profile.available_for_hire && (
                  <Pill accent="sage">Available for hire</Pill>
                )}
                {profile.hourly_rate != null && (
                  <Pill accent="gold">${profile.hourly_rate}/hr</Pill>
                )}
              </div>
              <p className="mt-0.5 inline-flex flex-wrap items-center gap-x-1.5 text-sm text-muted-foreground">
                <span>@{profile.handle}</span>
                {profile.location && (
                  <span className="inline-flex items-center gap-1">
                    · <MapPin size={13} /> {profile.location}
                  </span>
                )}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {isOwner ? (
                <Link href="/settings/profile" className="btn btn-ghost btn-sm">
                  <Pencil size={15} /> Edit profile
                </Link>
              ) : (
                <>
                  {noteCheck?.ok && (
                    <NoteButton
                      otherId={profile.id}
                      label="Message"
                      className="btn-primary"
                    />
                  )}
                  <FollowButton
                    builderId={profile.id}
                    initialFollowing={following}
                    isAuthed={isAuthed}
                    redirectTo={`/u/${profile.handle}`}
                  />
                  {isAuthed && (
                    <ReportMenu targetType="profile" targetId={profile.id} />
                  )}
                </>
              )}
            </div>
          </div>

          {profile.bio && (
            <p className="mt-4 max-w-2xl whitespace-pre-line text-[15px] leading-relaxed text-ink/90">
              {profile.bio}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t border-border pt-4">
            <Stat value={stats.projects} label="Projects" />
            <Stat value={stats.upvotes} label="Upvotes" />
            <Stat value={profile.follower_count} label="Followers" />
            <Stat value={joined} label="Joined" />
            <Stat value={profile.is_verified ? "Verified" : "Member"} label="Status" />
          </div>

          <ToolsSkills tools={profile.tools} skills={profile.skills} />

          {hasContact && (
            <div
              id="contact"
              className="mt-5 flex scroll-mt-24 flex-wrap items-center gap-2.5"
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
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold text-ink">
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
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
    </Container>
  );
}
