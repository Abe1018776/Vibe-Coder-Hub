import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/current-user";
import { Container, Eyebrow } from "@/components/brand/layout";
import { ProjectForm } from "@/components/showcase/project-form";
import { createProject } from "@/lib/actions/projects";

export const metadata = { title: "Submit a project" };

export default async function SubmitProjectPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login?next=/showcase/submit");

  return (
    <Container className="max-w-2xl py-12 md:py-16">
      <div className="text-center">
        <Eyebrow>Share your work</Eyebrow>
        <h1 className="mt-3 font-display text-[clamp(2rem,5vw,2.75rem)] font-bold tracking-tight text-ink">
          Submit a project
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[17px] text-muted-foreground">
          Show the community what you built — it appears on the Showcase and your
          profile automatically.
        </p>
      </div>
      <div className="mt-9 rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-sm)] md:p-8">
        <ProjectForm action={createProject} submitLabel="Submit project" />
      </div>
    </Container>
  );
}
