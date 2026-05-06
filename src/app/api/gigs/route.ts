import { NextRequest, NextResponse } from "next/server";
import { db, gigsTable } from "@/lib/db";
import { desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { slugify } from "@/lib/utils";
import { requireUser } from "@/lib/auth";

const createGigSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  type: z.enum(["task", "hourly", "build"]),
  status: z.enum(["open", "closed", "in_progress"]).default("open"),
  requirements: z.string().nullable().optional(),
  budgetMin: z.number().nullable().optional(),
  budgetMax: z.number().nullable().optional(),
  hourlyRate: z.number().nullable().optional(),
  tags: z.array(z.string()).default([]),
});

export async function GET() {
  const gigs = await db.select().from(gigsTable).orderBy(desc(gigsTable.createdAt));
  return NextResponse.json(gigs);
}

export async function POST(req: NextRequest) {
  const { response, userId } = await requireUser();
  if (response) return response;

  const json = await req.json();
  const parsed = createGigSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;
  const publicSlug = `${slugify(data.title).slice(0, 40) || "gig"}-${nanoid(8)}`;

  const [gig] = await db
    .insert(gigsTable)
    .values({
      title: data.title,
      description: data.description,
      type: data.type,
      status: data.status,
      requirements: data.requirements ?? null,
      budgetMin: data.budgetMin ?? null,
      budgetMax: data.budgetMax ?? null,
      hourlyRate: data.hourlyRate ?? null,
      tags: data.tags,
      publicSlug,
    })
    .returning();

  return NextResponse.json(gig, { status: 201 });
}
