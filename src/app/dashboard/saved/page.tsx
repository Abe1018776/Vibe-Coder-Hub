import { redirect } from "next/navigation";
import { Star, Lock } from "lucide-react";
import { getAuthUser } from "@/lib/current-user";
import { listSavedProjects, getMyUpvotedProjectIds } from "@/lib/queries";
import { ProjectCard } from "@/components/brand/project-card";
import { EmptyState } from "@/components/brand/empty-state";

export const metadata = { title: "Saved · Dashboard" };

export default async function DashboardSaved() {
  const user = await getAuthUser();
  if (!user) redirect("/login?next=/dashboard/saved");

  const [projects, upvoted] = await Promise.all([
    listSavedProjects(),
    getMyUpvotedProjectIds(),
  ]);
  const count = projects.length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
            Saved
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Projects you starred — private to you.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-[var(--shadow-xs)]">
          <Lock size={13} />
          {count === 0 ? "Only you" : `${count} saved · only you`}
        </span>
      </div>

      {count === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<Star size={22} />}
          title="Nothing saved yet"
          description="Tap the star on any project to keep it here. Your saves are private — only you can see them."
          actionHref="/showcase"
          actionLabel="Browse the Showcase"
        />
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              isAuthed
              upvoted={upvoted.has(p.id)}
              saved
            />
          ))}
        </div>
      )}
    </div>
  );
}
