import { redirect } from "next/navigation";
import { Star } from "lucide-react";
import { getAuthUser } from "@/lib/current-user";
import { listSavedProjects, getMyUpvotedProjectIds } from "@/lib/queries";
import { Container, Eyebrow } from "@/components/brand/layout";
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

  return (
    <Container className="py-10 md:py-14">
      <Eyebrow>Your collection</Eyebrow>
      <h1 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.25rem)] font-bold tracking-tight text-ink">
        Saved
      </h1>
      <p className="mt-2 text-[17px] text-muted-foreground">
        Projects you starred to come back to — only you can see this.
      </p>

      {projects.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<Star size={22} />}
          title="Nothing saved yet"
          description="Tap the star on any project to keep it here."
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
