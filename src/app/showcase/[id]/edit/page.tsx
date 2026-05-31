import { notFound, redirect } from "next/navigation";
import { getProjectById } from "@/lib/queries";
import { getAuthUser } from "@/lib/current-user";
import { Container, Eyebrow } from "@/components/brand/layout";
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
    <Container className="max-w-2xl py-12 md:py-16">
      <div className="text-center">
        <Eyebrow>Update your work</Eyebrow>
        <h1 className="mt-3 font-display text-[clamp(2rem,5vw,2.75rem)] font-bold tracking-tight text-ink">
          Edit project
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[17px] text-muted-foreground">
          Update your project details.
        </p>
      </div>
      <div className="mt-9 rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-sm)] md:p-8">
        <ProjectForm
          action={updateAction}
          project={project}
          submitLabel="Save changes"
        />
      </div>
    </Container>
  );
}
