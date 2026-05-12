import { notFound } from "next/navigation";
import { db, competitionsTable, competitionSubmissionsTable } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import CompetitionManageClient from "./_client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ManageCompetitionPage({ params }: Props) {
  const { userId } = await auth();
  const { id } = await params;
  const compId = Number(id);
  if (!compId) notFound();

  const [comp] = await db
    .select()
    .from(competitionsTable)
    .where(eq(competitionsTable.id, compId))
    .limit(1);
  if (!comp || comp.createdBy !== userId) notFound();

  const submissions = await db
    .select()
    .from(competitionSubmissionsTable)
    .where(eq(competitionSubmissionsTable.competitionId, compId))
    .orderBy(asc(competitionSubmissionsTable.createdAt));

  return <CompetitionManageClient competition={comp} submissions={submissions} />;
}
