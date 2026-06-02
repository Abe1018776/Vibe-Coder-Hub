import { redirect } from "next/navigation";
import { Star, Lock } from "lucide-react";
import { getAuthUser } from "@/lib/current-user";
import { listSavedProjects, getMyUpvotedProjectIds } from "@/lib/queries";
import { Container } from "@/components/brand/layout";
import { ProjectCard } from "@/components/brand/project-card";
import { EmptyState } from "@/components/brand/empty-state";

export const metadata = { title: "Saved" };

export default async function SavedPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login?next=/saved");

  const [projects, upvoted] = await Promise.all([
    listSavedProjects(),
    getMyUpvotedProjectIds(),
  ]);

  const count = projects.length;

  return (
    <Container className="py-8 md:py-12">
      {/* Clean, consistent header — icon well + title + private note. */}
      <div className="flex flex-wrap items-center gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold-50 text-gold-700">
          <Star size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-700">
            Your collection
          </p>
          <h1 className="mt-0.5 font-display text-[26px] font-bold tracking-tight text-ink sm:text-3xl">
            Saved
          </h1>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-[var(--shadow-xs)]">
          <Lock size={13} />
          {count === 0
            ? "Only you"
            : `${count} saved · only you`}
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
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
    </Container>
  );
}
