import Link from "next/link";
import type { Metadata } from "next";
import { Rocket, Briefcase, Trophy, Calendar } from "lucide-react";
import { getCurrentProfile } from "@/lib/current-user";
import { getDashboardStats } from "@/lib/dashboard";
import { getProjectsByOwner } from "@/lib/queries";
import { Panel, PanelLabel } from "@/components/brand/panel";
import { StatGrid } from "@/components/brand/stat-grid";
import { ActionCard } from "@/components/brand/action-card";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardOverview() {
  const profile = await getCurrentProfile();
  if (!profile) return null; // layout already redirects

  const [stats, projects] = await Promise.all([
    getDashboardStats(profile.id),
    getProjectsByOwner(profile.id),
  ]);
  const recent = projects.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
          Welcome back, {profile.name}
        </h1>
        <p className="text-sm text-muted-foreground">@{profile.handle}</p>
      </div>

      <Panel>
        <StatGrid
          stats={[
            { value: stats.projects, label: "Projects" },
            { value: stats.upvotes, label: "Upvotes" },
            { value: stats.gigs, label: "Gigs" },
            { value: stats.competitions, label: "Competitions" },
            { value: stats.events, label: "Events" },
            { value: stats.saved, label: "Saved" },
            { value: profile.follower_count, label: "Followers" },
            { value: 0, label: "Replies" },
          ]}
        />
      </Panel>

      <div>
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
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel>
          <PanelLabel>Your recent projects</PanelLabel>
          <ul className="mt-3 space-y-1">
            {recent.length === 0 ? (
              <li className="text-sm text-muted-foreground">
                Nothing yet — post your first project.
              </li>
            ) : (
              recent.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/showcase/${p.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-secondary"
                  >
                    <span className="truncate text-ink">{p.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {p.upvote_count} upvotes
                    </span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </Panel>

        <Panel>
          <PanelLabel>Private replies</PanelLabel>
          <p className="mt-3 text-sm text-muted-foreground">
            Your inbox is coming soon — private notes from other builders will
            land here.
          </p>
        </Panel>
      </div>
    </div>
  );
}
