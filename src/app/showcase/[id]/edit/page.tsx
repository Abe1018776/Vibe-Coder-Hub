import { notFound, redirect } from "next/navigation";
import { getProjectById } from "@/lib/queries";
import { getAuthUser } from "@/lib/current-user";
import { ProjectForm } from "@/components/showcase/project-form";
import { updateProject } from "@/lib/actions/projects";

export const metadata = { title: "Edit project" };

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) redirect(`/login?next=/showcase/${id}/edit`);

  const project = await getProjectById(id);
  if (!project) notFound();
  if (project.owner_id !== user.id) redirect(`/showcase/${id}`);

  const updateAction = updateProject.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-6">
      <h1 className="font-display text-3xl text-ink">Edit project</h1>
      <p className="mt-2 text-muted-foreground">
        Update your project details.
      </p>
      <div className="mt-8 rounded-card border border-border bg-surface p-6 md:p-8">
        <ProjectForm
          action={updateAction}
          project={project}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
