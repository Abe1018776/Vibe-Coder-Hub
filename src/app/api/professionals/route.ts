import { NextRequest, NextResponse } from "next/server";
import { db, professionalsTable } from "@/lib/db";
import { desc } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

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
  // Honeypot — must stay empty; bots that auto-fill will populate it.
  website_url_alt: z.string().max(0).optional(),
});

export async function GET() {
  const rows = await db
    .select()
    .from(professionalsTable)
    .orderBy(desc(professionalsTable.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  // Anonymous submissions allowed. Signed-in users get their userId recorded
  // on createdBy; anonymous submissions land with createdBy='' and can only
  // be edited/removed by admins.
  const { userId } = await auth();

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
      createdBy: userId ?? "",
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
