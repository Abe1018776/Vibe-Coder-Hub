import Link from "next/link";
import type { Metadata } from "next";
import { Pencil, Plus, ArrowUp, FolderOpen } from "lucide-react";
import { getCurrentProfile } from "@/lib/current-user";
import { getProjectsByOwner } from "@/lib/queries";
import { Panel } from "@/components/brand/panel";
import { EmptyState } from "@/components/brand/empty-state";
import { ShareButton } from "@/components/brand/share-button";

export const metadata: Metadata = { title: "My posts · Dashboard" };

export default async function DashboardPosts() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const projects = await getProjectsByOwner(profile.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
            My posts
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {projects.length === 0
              ? "Projects you submit appear here."
              : `${projects.length} project${projects.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Link href="/showcase/submit" className="btn btn-primary btn-sm">
          <Plus size={16} /> New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderOpen size={22} />}
          title="No projects yet"
          description="Show the community what you've built — your projects will appear here and on your public profile."
          actionHref="/showcase/submit"
          actionLabel="Submit a project"
        />
      ) : (
        <Panel className="p-0 sm:p-0">
          <ul className="divide-y divide-border">
            {projects.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-teal-50/40 sm:px-5"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/showcase/${p.id}`}
                    className="block truncate text-[15px] font-semibold text-ink hover:text-teal-800"
                  >
                    {p.name}
                  </Link>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <ArrowUp size={12} className="text-teal-600" />
                    {p.upvote_count} upvote{p.upvote_count === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
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
                    aria-label={`Edit ${p.name}`}
                  >
                    <Pencil size={15} />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
