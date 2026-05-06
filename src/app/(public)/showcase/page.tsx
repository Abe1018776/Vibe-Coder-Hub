import { db, showcaseProjectsTable } from "@/lib/db";
import { desc } from "drizzle-orm";
import ShowcaseClient from "./_client";

export const dynamic = "force-dynamic";

export default async function ShowcasePage() {
  const projects = await db
    .select()
    .from(showcaseProjectsTable)
    .orderBy(desc(showcaseProjectsTable.upvotes), desc(showcaseProjectsTable.createdAt));

  return <ShowcaseClient initialProjects={projects} />;
}
