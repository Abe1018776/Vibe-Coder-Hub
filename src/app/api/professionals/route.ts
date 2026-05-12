import { NextRequest, NextResponse } from "next/server";
import { db, professionalsTable } from "@/lib/db";
import { desc } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const createSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  company: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  expertise: z.array(z.string()).default([]),
  linkedIn: z.string().url().nullable().optional().or(z.literal("")).optional(),
  website: z.string().url().nullable().optional().or(z.literal("")).optional(),
  email: z.string().email().nullable().optional().or(z.literal("")).optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().nullable().optional(),
});

export async function GET() {
  const rows = await db
    .select()
    .from(professionalsTable)
    .orderBy(desc(professionalsTable.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { response, userId } = await requireUser();
  if (response) return response;

  const json = await req.json();
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  const [row] = await db
    .insert(professionalsTable)
    .values({
      name: d.name,
      title: d.title,
      company: d.company || null,
      location: d.location || null,
      bio: d.bio || null,
      expertise: d.expertise,
      linkedIn: d.linkedIn || null,
      website: d.website || null,
      email: d.email || null,
      tags: d.tags,
      notes: d.notes || null,
      createdBy: userId,
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
