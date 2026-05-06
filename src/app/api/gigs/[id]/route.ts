import { NextRequest, NextResponse } from "next/server";
import { db, gigsTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const patchSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  type: z.enum(["task", "hourly", "build"]).optional(),
  status: z.enum(["open", "closed", "in_progress"]).optional(),
  requirements: z.string().nullable().optional(),
  budgetMin: z.number().nullable().optional(),
  budgetMax: z.number().nullable().optional(),
  hourlyRate: z.number().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response } = await requireUser();
  if (response) return response;

  const { id } = await params;
  const gigId = Number(id);
  if (!gigId) return NextResponse.json({ error: "bad id" }, { status: 400 });

  const json = await req.json();
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [updated] = await db
    .update(gigsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(gigsTable.id, gigId))
    .returning();

  if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response } = await requireUser();
  if (response) return response;

  const { id } = await params;
  const gigId = Number(id);
  if (!gigId) return NextResponse.json({ error: "bad id" }, { status: 400 });

  await db.delete(gigsTable).where(eq(gigsTable.id, gigId));
  return NextResponse.json({ ok: true });
}
