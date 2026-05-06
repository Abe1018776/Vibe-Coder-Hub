import { NextRequest, NextResponse } from "next/server";
import { db, freelancersTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().nullable().optional(),
  skills: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  hourlyRate: z.number().nullable().optional(),
  portfolioLinks: z.array(z.string()).optional(),
  contactInfo: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  tools: z.array(z.string()).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response } = await requireUser();
  if (response) return response;

  const { id } = await params;
  const fid = Number(id);
  if (!fid) return NextResponse.json({ error: "bad id" }, { status: 400 });

  const json = await req.json();
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const [updated] = await db
    .update(freelancersTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(freelancersTable.id, fid))
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
  const fid = Number(id);
  if (!fid) return NextResponse.json({ error: "bad id" }, { status: 400 });
  await db.delete(freelancersTable).where(eq(freelancersTable.id, fid));
  return NextResponse.json({ ok: true });
}
