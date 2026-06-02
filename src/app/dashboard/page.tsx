import Link from "next/link";
import type { Metadata } from "next";
import {
  Rocket,
  Briefcase,
  Trophy,
  Calendar,
  ArrowUpRight,
  FolderOpen,
  Inbox as InboxIcon,
} from "lucide-react";
import { getCurrentProfile } from "@/lib/current-user";
import { getDashboardStats } from "@/lib/dashboard";
import { getProjectsByOwner } from "@/lib/queries";
import { getMyConversations, getUnreadReplyCount } from "@/lib/conversations";
import { AvatarCircle } from "@/components/brand/avatar-circle";
import { Panel, PanelLabel } from "@/components/brand/panel";
import { StatGrid } from "@/components/brand/stat-grid";
import { ActionCard } from "@/components/brand/action-card";
import { formatRelativeTime } from "@/lib/utils";

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
      {/* At-a-glance numbers */}
      <Panel className="p-5 sm:p-6">
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

      {/* Primary actions */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <PanelLabel>Post something</PanelLabel>
          <span className="text-xs text-muted-foreground">
            Share it with the community
          </span>
        </div>
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

      {/* Recent activity */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel className="flex flex-col">
          <div className="flex items-center justify-between">
            <PanelLabel>Recent projects</PanelLabel>
            {recent.length > 0 && (
              <Link
                href="/dashboard/posts"
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-800 hover:underline"
              >
                View all <ArrowUpRight size={13} />
              </Link>
            )}
          </div>
          {recent.length === 0 ? (
            <div className="mt-4 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-canvas/50 px-4 py-8 text-center">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-700">
                <FolderOpen size={18} />
              </span>
              <p className="mt-3 text-sm font-medium text-ink">No projects yet</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Your projects will show up here.
              </p>
              <Link
                href="/showcase/submit"
                className="btn btn-primary btn-sm mt-4"
              >
                Post your first project
              </Link>
            </div>
          ) : (
            <ul className="mt-3 -mx-1 space-y-0.5">
              {recent.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/showcase/${p.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-teal-50/60"
                  >
                    <span className="truncate text-sm font-medium text-ink">
                      {p.name}
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                      {p.upvote_count} upvotes
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel className="flex flex-col">
          <div className="flex items-center justify-between">
            <PanelLabel>Messages</PanelLabel>
            <Link
              href="/dashboard/inbox"
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-800 hover:underline"
            >
              Open inbox <ArrowUpRight size={13} />
            </Link>
          </div>
          {recentConvos.length === 0 ? (
            <div className="mt-4 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-canvas/50 px-4 py-8 text-center">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-700">
                <InboxIcon size={18} />
              </span>
              <p className="mt-3 text-sm font-medium text-ink">No messages yet</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Private notes from other builders land here.
              </p>
            </div>
          ) : (
            <ul className="mt-3 -mx-1 space-y-0.5">
              {recentConvos.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/dashboard/inbox/${c.id}`}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-teal-50/60"
                  >
                    <AvatarCircle
                      name={c.other.name}
                      src={c.other.avatar_url}
                      size={36}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                      {c.other.name}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelativeTime(c.last_message_at)}
                    </span>
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
