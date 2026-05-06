import { NextRequest, NextResponse } from "next/server";
import { db, availabilitySlotsTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const patchSchema = z.object({
  isBooked: z.boolean().optional(),
  bookedByNote: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response } = await requireUser();
  if (response) return response;
  const { id } = await params;
  const sid = Number(id);
  if (!sid) return NextResponse.json({ error: "bad id" }, { status: 400 });

  const json = await req.json();
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const [updated] = await db
    .update(availabilitySlotsTable)
    .set(parsed.data)
    .where(eq(availabilitySlotsTable.id, sid))
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
  const sid = Number(id);
  if (!sid) return NextResponse.json({ error: "bad id" }, { status: 400 });
  await db.delete(availabilitySlotsTable).where(eq(availabilitySlotsTable.id, sid));
  return NextResponse.json({ ok: true });
}
