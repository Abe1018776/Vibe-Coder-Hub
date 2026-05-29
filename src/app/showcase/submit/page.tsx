import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/current-user";
import { ProjectForm } from "@/components/showcase/project-form";
import { createProject } from "@/lib/actions/projects";

export const metadata = { title: "Submit a project" };

export default async function SubmitProjectPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login?next=/showcase/submit");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-6">
      <h1 className="font-display text-3xl text-ink">Submit a project</h1>
      <p className="mt-2 text-muted-foreground">
        Show the community what you built — it appears on the Showcase and your
        profile automatically.
      </p>
      <div className="mt-8 rounded-card border border-border bg-surface p-6 md:p-8">
        <ProjectForm action={createProject} submitLabel="Submit project" />
      </div>
    </div>
  );
}
