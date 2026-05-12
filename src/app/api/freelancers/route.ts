import { NextRequest, NextResponse } from "next/server";
import { db, freelancersTable } from "@/lib/db";
import { desc } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1),
  bio: z.string().nullable().optional(),
  skills: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  hourlyRate: z.number().nullable().optional(),
  portfolioLinks: z.array(z.string()).default([]),
  contactInfo: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  tools: z.array(z.string()).default([]),
});

export async function GET() {
  const rows = await db
    .select()
    .from(freelancersTable)
    .orderBy(desc(freelancersTable.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { response, userId } = await requireUser();
  if (response) return response;

  const json = await req.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;
  const [created] = await db
    .insert(freelancersTable)
    .values({
      name: d.name,
      bio: d.bio ?? null,
      skills: d.skills,
      tags: d.tags,
      hourlyRate: d.hourlyRate ?? null,
      portfolioLinks: d.portfolioLinks,
      contactInfo: d.contactInfo ?? null,
      notes: d.notes ?? null,
      tools: d.tools,
      createdBy: userId,
    })
    .returning();
  return NextResponse.json(created, { status: 201 });
}
