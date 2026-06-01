import Link from "next/link";
import type { Metadata } from "next";
import { Pencil, ArrowUp, Rocket } from "lucide-react";
import { getCurrentProfile } from "@/lib/current-user";
import { getProjectsByOwner } from "@/lib/queries";
import { Panel, PanelLabel } from "@/components/brand/panel";
import { ShareButton } from "@/components/brand/share-button";
import { EmptyState } from "@/components/brand/empty-state";
import { accentFor, ACCENT_HERO } from "@/lib/site";

export const metadata: Metadata = { title: "My posts · Dashboard" };

export default async function DashboardPosts() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const projects = await getProjectsByOwner(profile.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
          My posts
        </h1>
        <Link href="/showcase/submit" className="btn btn-sweep btn-sm">
          <Rocket size={15} /> New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={<Rocket size={22} />}
          title="No projects yet"
          description="Show the community what you've built — your projects appear here once you post them."
          actionHref="/showcase/submit"
          actionLabel="Submit a project"
        />
      ) : (
        <Panel>
          <PanelLabel>
            Projects · {projects.length}
          </PanelLabel>
          <ul className="mt-3 divide-y divide-border">
            {projects.map((p) => {
              const accent = accentFor(p.name);
              return (
                <li
                  key={p.id}
                  className="flex items-center gap-3 py-3 first:pt-1 last:pb-1"
                >
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg font-display text-sm font-bold text-white"
                    style={{ backgroundImage: ACCENT_HERO[accent] }}
                    aria-hidden
                  >
                    {p.name.slice(0, 1).toUpperCase()}
                  </span>
                  <Link
                    href={`/showcase/${p.id}`}
                    className="min-w-0 flex-1 truncate text-sm font-semibold text-ink hover:text-teal-800 hover:underline"
                  >
                    {p.name}
                  </Link>
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground">
                    <ArrowUp size={13} /> {p.upvote_count}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <ShareButton
                      path={`/showcase/${p.id}`}
                      title={p.name}
                      caption={`Check out my project "${p.name}" on YidVibe →`}
                      label=""
                      className="btn-sm"
                    />
                    <Link
                      href={`/showcase/${p.id}/edit`}
                      className="btn btn-ghost btn-sm"
                      aria-label="Edit"
                    >
                      <Pencil size={15} />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}
    </div>
  );
}
