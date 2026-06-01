import Link from "next/link";
import type { Metadata } from "next";
import { Pencil } from "lucide-react";
import { getCurrentProfile } from "@/lib/current-user";
import { getProjectsByOwner } from "@/lib/queries";
import { Panel, PanelLabel } from "@/components/brand/panel";
import { ShareButton } from "@/components/brand/share-button";

export const metadata: Metadata = { title: "My posts · Dashboard" };

export default async function DashboardPosts() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const projects = await getProjectsByOwner(profile.id);

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
        My posts
      </h1>

      <Panel>
        <PanelLabel>Projects · {projects.length}</PanelLabel>
        {projects.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            You haven&apos;t posted a project yet.{" "}
            <Link href="/showcase/submit" className="text-teal-800 hover:underline">
              Submit one →
            </Link>
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-border">
            {projects.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <Link
                  href={`/showcase/${p.id}`}
                  className="min-w-0 flex-1 truncate text-sm font-medium text-ink hover:underline"
                >
                  {p.name}
                </Link>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {p.upvote_count} upvotes
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
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
