import { NextRequest, NextResponse } from "next/server";
import { db, competitionsTable, competitionSubmissionsTable } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const schema = z.object({
  submissionId: z.number().int().positive().nullable(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response, userId } = await requireUser();
  if (response) return response;

  const { id } = await params;
  const compId = Number(id);
  if (!compId) return NextResponse.json({ error: "bad id" }, { status: 400 });

  const [existing] = await db
    .select()
    .from(competitionsTable)
    .where(eq(competitionsTable.id, compId))
    .limit(1);
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (existing.createdBy !== userId)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const json = await req.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.submissionId !== null) {
    const [sub] = await db
      .select({ id: competitionSubmissionsTable.id })
      .from(competitionSubmissionsTable)
      .where(
        and(
          eq(competitionSubmissionsTable.id, parsed.data.submissionId),
          eq(competitionSubmissionsTable.competitionId, compId),
        ),
      )
      .limit(1);
    if (!sub)
      return NextResponse.json({ error: "submission not in competition" }, { status: 400 });
  }

  const [updated] = await db
    .update(competitionsTable)
    .set({
      winnerSubmissionId: parsed.data.submissionId,
      status: parsed.data.submissionId ? "closed" : "open",
      updatedAt: new Date(),
    })
    .where(eq(competitionsTable.id, compId))
    .returning();

  return NextResponse.json(updated);
}
