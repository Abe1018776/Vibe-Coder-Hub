import { db, showcaseProjectsTable, showcaseCommentsTable } from "@/lib/db";
import { desc, asc, sql } from "drizzle-orm";
import ShowcaseClient from "./_client";

export const dynamic = "force-dynamic";

export default async function ShowcasePage() {
  const projects = await db
    .select()
    .from(showcaseProjectsTable)
    .orderBy(desc(showcaseProjectsTable.upvotes), desc(showcaseProjectsTable.createdAt));

  const allComments = await db
    .select()
    .from(showcaseCommentsTable)
    .orderBy(asc(showcaseCommentsTable.createdAt));

  const commentsByProject = new Map<number, typeof allComments>();
  for (const c of allComments) {
    const list = commentsByProject.get(c.projectId) ?? [];
    list.push(c);
    commentsByProject.set(c.projectId, list);
  }

  return (
    <ShowcaseClient
      initialProjects={projects.map((p) => ({
        ...p,
        comments: commentsByProject.get(p.id) ?? [],
      }))}
    />
  );
}
