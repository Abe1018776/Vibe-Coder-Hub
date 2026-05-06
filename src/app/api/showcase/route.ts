import { NextRequest, NextResponse } from "next/server";
import { db, showcaseProjectsTable } from "@/lib/db";
import { desc } from "drizzle-orm";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  url: z.string().url().nullable().optional().or(z.literal("")),
  builderName: z.string().min(1),
  tags: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
});

export async function GET() {
  const rows = await db
    .select()
    .from(showcaseProjectsTable)
    .orderBy(desc(showcaseProjectsTable.upvotes), desc(showcaseProjectsTable.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;
  const [created] = await db
    .insert(showcaseProjectsTable)
    .values({
      name: d.name,
      description: d.description,
      url: d.url || null,
      builderName: d.builderName,
      tags: d.tags,
      tools: d.tools,
    })
    .returning();
  return NextResponse.json(created, { status: 201 });
}
