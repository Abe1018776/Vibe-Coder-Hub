import { NextRequest, NextResponse } from "next/server";
import { db, competitionsTable, competitionSubmissionsTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const patchSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  prizeAmount: z.number().min(0).optional(),
  deadline: z.string().optional(),
  status: z.enum(["open", "judging", "closed"]).optional(),
  loomUrl: z.string().url().nullable().optional().or(z.literal("")).optional(),
  referenceUrls: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response, userId } = await requireUser();
  if (response) return response;

  const { id } = await params;
  const compId = Number(id);
  if (!compId) return NextResponse.json({ error: "bad id" }, { status: 400 });

  const [row] = await db
    .select()
    .from(competitionsTable)
    .where(eq(competitionsTable.id, compId))
    .limit(1);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (row.createdBy !== userId)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const submissions = await db
    .select()
    .from(competitionSubmissionsTable)
    .where(eq(competitionSubmissionsTable.competitionId, compId))
    .orderBy(competitionSubmissionsTable.createdAt);

  return NextResponse.json({ competition: row, submissions });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response, userId } = await requireUser();
  if (response) return response;

  const { id } = await params;
  const compId = Number(id);
  if (!compId) return NextResponse.json({ error: "bad id" }, { status: 400 });

  const [existing] = await db
    .select({ createdBy: competitionsTable.createdBy })
    .from(competitionsTable)
    .where(eq(competitionsTable.id, compId))
    .limit(1);
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (existing.createdBy !== userId)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const json = await req.json();
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const update: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
  if (parsed.data.deadline) update.deadline = new Date(parsed.data.deadline);
  if (parsed.data.loomUrl !== undefined) update.loomUrl = parsed.data.loomUrl || null;

  const [updated] = await db
    .update(competitionsTable)
    .set(update)
    .where(eq(competitionsTable.id, compId))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response, userId } = await requireUser();
  if (response) return response;

  const { id } = await params;
  const compId = Number(id);
  if (!compId) return NextResponse.json({ error: "bad id" }, { status: 400 });

  const [existing] = await db
    .select({ createdBy: competitionsTable.createdBy })
    .from(competitionsTable)
    .where(eq(competitionsTable.id, compId))
    .limit(1);
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (existing.createdBy !== userId)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  await db.delete(competitionsTable).where(eq(competitionsTable.id, compId));
  return NextResponse.json({ ok: true });
}
