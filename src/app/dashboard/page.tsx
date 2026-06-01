import Link from "next/link";
import type { Metadata } from "next";
import {
  Rocket,
  Briefcase,
  Trophy,
  Calendar,
  ArrowRight,
  ArrowUp,
  Inbox,
} from "lucide-react";
import { getCurrentProfile } from "@/lib/current-user";
import { getDashboardStats } from "@/lib/dashboard";
import { getProjectsByOwner } from "@/lib/queries";
import { getMyConversations, getUnreadReplyCount } from "@/lib/conversations";
import { AvatarCircle } from "@/components/brand/avatar-circle";
import { Panel, PanelLabel } from "@/components/brand/panel";
import { StatGrid } from "@/components/brand/stat-grid";
import { ActionCard } from "@/components/brand/action-card";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardOverview() {
  const profile = await getCurrentProfile();
  if (!profile) return null; // layout already redirects

  const [stats, projects, convos, unreadReplies] = await Promise.all([
    getDashboardStats(profile.id),
    getProjectsByOwner(profile.id),
    getMyConversations(),
    getUnreadReplyCount(),
  ]);
  const recent = projects.slice(0, 5);
  const recentConvos = convos.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Header — avatar anchors the welcome line and a clear primary CTA. */}
      <header className="flex flex-wrap items-center gap-4">
        <AvatarCircle
          name={profile.name}
          src={profile.avatar_url}
          size={52}
        />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
            Welcome back, {profile.name}
          </h1>
          <p className="text-sm text-muted-foreground">@{profile.handle}</p>
        </div>
        <Link href="/showcase/submit" className="btn btn-sweep btn-sm">
          <Rocket size={15} /> New project
        </Link>
      </header>

      <Panel>
        <PanelLabel className="mb-4">At a glance</PanelLabel>
        <StatGrid
          stats={[
            { value: stats.projects, label: "Projects" },
            { value: stats.upvotes, label: "Upvotes" },
            { value: stats.gigs, label: "Gigs" },
            { value: stats.competitions, label: "Competitions" },
            { value: stats.events, label: "Events" },
            { value: stats.saved, label: "Saved" },
            { value: profile.follower_count, label: "Followers" },
            { value: unreadReplies, label: "Unread" },
          ]}
        />
      </Panel>

      <section>
        <PanelLabel className="mb-3">Post something</PanelLabel>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <ActionCard
            href="/showcase/submit"
            accent="teal"
            icon={<Rocket size={20} />}
            label="Project"
            description="Show what you built"
          />
          <ActionCard
            href="/gigs/post"
            accent="gold"
            icon={<Briefcase size={20} />}
            label="Gig"
            description="Hire or get hired"
          />
          <ActionCard
            href="/competitions/post"
            accent="clay"
            icon={<Trophy size={20} />}
            label="Competition"
            description="Run a challenge"
          />
          <ActionCard
            href="/events/post"
            accent="sage"
            icon={<Calendar size={20} />}
            label="Event"
            description="Gather the community"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel className="flex flex-col">
          <div className="flex items-center justify-between">
            <PanelLabel>Recent projects</PanelLabel>
            {recent.length > 0 && (
              <Link
                href="/dashboard/posts"
                className="link-arrow text-[13px]"
              >
                View all <ArrowRight size={14} />
              </Link>
            )}
          </div>
          {recent.length === 0 ? (
            <div className="mt-4 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border py-8 text-center">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-teal-50 text-teal-600">
                <Rocket size={18} />
              </span>
              <p className="mt-3 text-sm text-muted-foreground">
                Nothing yet — post your first project.
              </p>
              <Link
                href="/showcase/submit"
                className="btn btn-primary btn-sm mt-4"
              >
                Submit a project
              </Link>
            </div>
          ) : (
            <ul className="mt-3 space-y-0.5">
              {recent.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/showcase/${p.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-secondary"
                  >
                    <span className="truncate font-medium text-ink">
                      {p.name}
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground">
                      <ArrowUp size={13} /> {p.upvote_count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel className="flex flex-col">
          <div className="flex items-center justify-between">
            <PanelLabel>Private replies</PanelLabel>
            <Link href="/dashboard/inbox" className="link-arrow text-[13px]">
              Inbox <ArrowRight size={14} />
            </Link>
          </div>
          {recentConvos.length === 0 ? (
            <div className="mt-4 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border py-8 text-center">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-teal-50 text-teal-600">
                <Inbox size={18} />
              </span>
              <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                No notes yet — private notes from other builders land here.
              </p>
            </div>
          ) : (
            <ul className="mt-3 space-y-0.5">
              {recentConvos.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/dashboard/inbox/${c.id}`}
                    className="flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-secondary"
                  >
                    <AvatarCircle
                      name={c.other.name}
                      src={c.other.avatar_url}
                      size={32}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">
                        {c.other.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        @{c.other.handle}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
