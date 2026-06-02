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
  CalendarDays,
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
import { Panel, PanelLabel } from "@/components/brand/panel";
import { Sparkle } from "@/components/brand/sparkle";
import { FollowButton } from "@/components/brand/follow-button";
import { ToolsSkills } from "@/components/profile/tools-skills";
import { EmptyState } from "@/components/brand/empty-state";
import { ReportMenu } from "@/components/brand/report-menu";
import { NoteButton } from "@/components/messaging/note-button";
import { canMessage } from "@/lib/conversations";
import { cn } from "@/lib/utils";

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

function LinkButton({
  href,
  icon,
  variant = "ghost",
  children,
}: {
  href: string;
  icon: React.ReactNode;
  /** Direct-contact channels get the branded teal treatment; links stay ghost. */
  variant?: "primary" | "ghost";
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("btn btn-sm", variant === "primary" ? "btn-primary" : "btn-ghost")}
    >
      {icon}
      {children}
    </a>
  );
}

/** A single compact stat in the identity rail: number over a tiny label. */
function MiniStat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-lg font-bold leading-none text-ink">
        {value}
      </div>
      <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </div>
    </div>
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

  const hasTools = profile.tools.length > 0 || profile.skills.length > 0;
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
    <Container className="max-w-5xl py-8 md:py-10">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-8">
        {/* ── Left identity rail — sticky on desktop, compact and organized ── */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-[var(--shadow-sm)]">
            {/* Slim cover band; avatar overlaps it below. */}
            {profile.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.cover_url}
                alt=""
                className="h-20 w-full object-cover"
              />
            ) : (
              <div className="h-20" style={{ backgroundImage: BANNER[accent] }} />
            )}

            <div className="px-5 pb-5">
              <div className="flex items-end justify-between">
                <AvatarCircle
                  name={profile.name}
                  src={profile.avatar_url}
                  size={88}
                  accent={accent}
                  className="-mt-11 border-4 border-surface shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
                />
                {/* Report stays discreet, top-right of the rail for non-owners. */}
                {!isOwner && isAuthed && (
                  <ReportMenu targetType="profile" targetId={profile.id} />
                )}
              </div>

              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl font-bold leading-tight tracking-tight text-ink">
                    {profile.name}
                  </h1>
                  {profile.is_verified && (
                    <span title="Verified">
                      <Sparkle size={18} color="var(--gold-500)" />
                    </span>
                  )}
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                  <span>@{profile.handle}</span>
                  {profile.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={13} /> {profile.location}
                    </span>
                  )}
                </p>
              </div>

              {(profile.available_for_hire || profile.hourly_rate != null) && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {profile.available_for_hire && (
                    <Pill accent="sage">Available for hire</Pill>
                  )}
                  {profile.hourly_rate != null && (
                    <Pill accent="gold">${profile.hourly_rate}/hr</Pill>
                  )}
                </div>
              )}

              {/* Compact stats strip — scannable numbers, not a full-width grid. */}
              <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-border bg-secondary/40 py-3">
                <MiniStat value={stats.projects} label="Projects" />
                <MiniStat value={stats.upvotes} label="Upvotes" />
                <MiniStat value={profile.follower_count} label="Followers" />
              </div>

              {/* Primary actions sit directly under identity. */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {isOwner ? (
                  <Link
                    href="/settings/profile"
                    className="btn btn-gold btn-sm flex-1"
                  >
                    <Pencil size={15} /> Edit profile
                  </Link>
                ) : (
                  <>
                    {noteCheck?.ok && (
                      <NoteButton
                        otherId={profile.id}
                        label="Message"
                        className="btn-primary flex-1"
                      />
                    )}
                    <FollowButton
                      builderId={profile.id}
                      initialFollowing={following}
                      isAuthed={isAuthed}
                      redirectTo={`/u/${profile.handle}`}
                    />
                  </>
                )}
              </div>

              <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays size={13} /> Joined {joined}
                <span aria-hidden>·</span>
                {profile.is_verified ? "Verified" : "Member"}
              </p>
            </div>
          </div>

          {/* Tools & skills live in the rail, beside the identity. */}
          {hasTools && (
            <Panel className="mt-4">
              <PanelLabel>Tools &amp; skills</PanelLabel>
              {/* Neutralize the component's own top margin; the label sets the gap. */}
              <div className="mt-3 [&>div]:!mt-0">
                <ToolsSkills tools={profile.tools} skills={profile.skills} />
              </div>
            </Panel>
          )}

          {/* Contact — direct channels branded teal, links stay ghost. */}
          {hasContact && (
            <Panel className="mt-4">
              <span id="contact" className="block scroll-mt-24" aria-hidden />
              <PanelLabel>Get in touch</PanelLabel>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {links.email && (
                  <LinkButton href={contactHref("email", links.email)} variant="primary" icon={<Mail size={15} />}>
                    Email
                  </LinkButton>
                )}
                {links.phone && (
                  <LinkButton href={contactHref("phone", links.phone)} variant="primary" icon={<Phone size={15} />}>
                    Call
                  </LinkButton>
                )}
                {links.whatsapp && (
                  <LinkButton href={contactHref("whatsapp", links.whatsapp)} variant="primary" icon={<MessageCircle size={15} />}>
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
            </Panel>
          )}
        </aside>

        {/* ── Right content column — bio + projects, the visual focus ── */}
        <div className="min-w-0">
          {profile.bio && (
            <Panel>
              <PanelLabel>About</PanelLabel>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink/90">
                {profile.bio}
              </p>
            </Panel>
          )}

          <section className={cn(profile.bio && "mt-6")}>
            <div className="flex items-end justify-between gap-3">
              <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">
                {isOwner ? "Your projects" : "Projects"}
              </h2>
              {withOwner.length > 0 && (
                <span className="text-sm font-medium text-muted-foreground">
                  {withOwner.length}
                </span>
              )}
            </div>
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
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
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
      </div>
    </Container>
  );
}
