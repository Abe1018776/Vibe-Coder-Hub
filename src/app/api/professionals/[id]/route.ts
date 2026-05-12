import { NextRequest, NextResponse } from "next/server";
import { db, professionalsTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getAdminContext } from "@/lib/auth";

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  company: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  expertise: z.array(z.string()).optional(),
  linkedIn: z.string().url().nullable().optional().or(z.literal("")).optional(),
  website: z.string().url().nullable().optional().or(z.literal("")).optional(),
  email: z.string().email().nullable().optional().or(z.literal("")).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId, isAdmin } = await getAdminContext();
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const pid = Number(id);
  if (!pid) return NextResponse.json({ error: "bad id" }, { status: 400 });

  const [row] = await db
    .select({ createdBy: professionalsTable.createdBy })
    .from(professionalsTable)
    .where(eq(professionalsTable.id, pid))
    .limit(1);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (row.createdBy !== userId && !isAdmin)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const json = await req.json();
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updates: Record<string, unknown> = {
    ...parsed.data,
    updatedAt: new Date(),
  };
  if ("linkedIn" in updates) updates.linkedIn = updates.linkedIn || null;
  if ("website" in updates) updates.website = updates.website || null;
  if ("email" in updates) updates.email = updates.email || null;
  if ("company" in updates) updates.company = updates.company || null;
  if ("location" in updates) updates.location = updates.location || null;
  if ("bio" in updates) updates.bio = updates.bio || null;
  if ("notes" in updates) updates.notes = updates.notes || null;

  const [updated] = await db
    .update(professionalsTable)
    .set(updates)
    .where(eq(professionalsTable.id, pid))
    .returning();
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId, isAdmin } = await getAdminContext();
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const pid = Number(id);
  if (!pid) return NextResponse.json({ error: "bad id" }, { status: 400 });

  const [row] = await db
    .select({ createdBy: professionalsTable.createdBy })
    .from(professionalsTable)
    .where(eq(professionalsTable.id, pid))
    .limit(1);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (row.createdBy !== userId && !isAdmin)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  await db.delete(professionalsTable).where(eq(professionalsTable.id, pid));
  return NextResponse.json({ ok: true });
}
