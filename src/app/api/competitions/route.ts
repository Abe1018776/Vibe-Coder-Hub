import { NextRequest, NextResponse } from "next/server";
import { db, competitionsTable } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { slugify } from "@/lib/utils";
import { requireUser } from "@/lib/auth";

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  prizeAmount: z.number().min(0),
  deadline: z.string().min(1),
  status: z.enum(["open", "judging", "closed"]).default("open"),
  loomUrl: z.string().url().nullable().optional().or(z.literal("")).optional(),
  referenceUrls: z.array(z.string().url()).default([]),
  tags: z.array(z.string()).default([]),
});

export async function GET() {
  const { response, userId } = await requireUser();
  if (response) return response;

  const rows = await db
    .select()
    .from(competitionsTable)
    .where(eq(competitionsTable.createdBy, userId))
    .orderBy(desc(competitionsTable.createdAt));
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
  const data = parsed.data;
  const publicSlug = `${slugify(data.title).slice(0, 40) || "competition"}-${nanoid(8)}`;

  const [row] = await db
    .insert(competitionsTable)
    .values({
      createdBy: userId,
      title: data.title,
      description: data.description,
      prizeAmount: data.prizeAmount,
      deadline: new Date(data.deadline),
      status: data.status,
      loomUrl: data.loomUrl || null,
      referenceUrls: data.referenceUrls,
      tags: data.tags,
      publicSlug,
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
