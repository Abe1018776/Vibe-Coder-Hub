import { db, showcaseProjectsTable, showcaseCommentsTable } from "@/lib/db";
import { desc, asc } from "drizzle-orm";
import ShowcaseClient from "../showcase/_client";

export const dynamic = "force-dynamic";

// Tags (case-insensitive) that qualify a showcase project as a
// Torah / Jewish communal AI project. Match if ANY of a project's tags
// appears in this set.
const TORAH_KEYWORDS = new Set(
  [
    "torah",
    "jewish",
    "judaism",
    "jewry",
    "communal",
    "halacha",
    "halachah",
    "kashrus",
    "kashrut",
    "kosher",
    "tanach",
    "tanakh",
    "talmud",
    "gemara",
    "mishna",
    "mishnah",
    "chumash",
    "midrash",
    "hebrew",
    "yiddish",
    "shul",
    "yeshiva",
    "shabbos",
    "shabbat",
    "chesed",
    "tzedaka",
    "tzedakah",
    "shidduch",
    "shidduchim",
  ].map((s) => s.toLowerCase()),
);

function isTorahProject(tags: string[]): boolean {
  return tags.some((t) => TORAH_KEYWORDS.has(t.trim().toLowerCase()));
}

export default async function TorahShowcasePage() {
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

  const torahProjects = projects
    .filter((p) => isTorahProject(p.tags))
    .map((p) => ({
      ...p,
      comments: commentsByProject.get(p.id) ?? [],
    }));

  return (
    <ShowcaseClient
      initialProjects={torahProjects}
      title="Torah & Jewish AI"
      subtitle="AI tools built for Torah learning and Jewish communal life"
      emptyText="No Torah or Jewish AI projects tagged yet. Submit one and tag it 'torah' or 'jewish' to feature it here."
      defaultTags="torah"
    />
  );
}
