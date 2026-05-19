import { NextRequest, NextResponse } from "next/server";
import { db, showcaseProjectsTable } from "@/lib/db";
import { desc, sql } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  url: z.string().url().nullable().optional().or(z.literal("")),
  imageUrl: z.string().url().nullable().optional().or(z.literal("")),
  videoUrl: z.string().url().nullable().optional().or(z.literal("")),
  builderName: z.string().min(1),
  tags: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  // Honeypot — must be empty. Real users never see this field; bots
  // that auto-fill every input will populate it and get silently rejected.
  website_url_alt: z.string().max(0).optional(),
});

export async function GET() {
  const rows = await db
    .select()
    .from(showcaseProjectsTable)
    .orderBy(desc(showcaseProjectsTable.upvotes), desc(showcaseProjectsTable.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  // Anonymous submissions allowed. If the user happens to be signed in we
  // record their userId so they (and admins) can edit later; otherwise
  // createdBy stays empty and only admins can edit/remove the project.
  const { userId } = await auth();

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
      imageUrl: d.imageUrl || null,
      videoUrl: d.videoUrl || null,
      builderName: d.builderName,
      tags: d.tags,
      tools: d.tools,
      createdBy: userId ?? "",
    })
    .returning();
  return NextResponse.json(created, { status: 201 });
}
