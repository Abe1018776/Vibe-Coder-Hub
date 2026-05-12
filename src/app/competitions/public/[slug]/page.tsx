import { notFound } from "next/navigation";
import { db, competitionsTable, competitionSubmissionsTable } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import CompetitionPublicClient from "./_client";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CompetitionPublicPage({ params }: Props) {
  const { slug } = await params;
  const [comp] = await db
    .select()
    .from(competitionsTable)
    .where(eq(competitionsTable.publicSlug, slug))
    .limit(1);

  if (!comp) notFound();

  const submissions = await db
    .select({
      id: competitionSubmissionsTable.id,
      submitterName: competitionSubmissionsTable.submitterName,
      submissionUrl: competitionSubmissionsTable.submissionUrl,
      loomUrl: competitionSubmissionsTable.loomUrl,
      description: competitionSubmissionsTable.description,
      createdAt: competitionSubmissionsTable.createdAt,
    })
    .from(competitionSubmissionsTable)
    .where(eq(competitionSubmissionsTable.competitionId, comp.id))
    .orderBy(asc(competitionSubmissionsTable.createdAt));

  return (
    <CompetitionPublicClient
      competition={comp}
      submissions={submissions}
      slug={slug}
    />
  );
}
