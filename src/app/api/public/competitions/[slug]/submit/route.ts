import { NextRequest, NextResponse } from "next/server";
import { db, competitionsTable, competitionSubmissionsTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";

const submitSchema = z.object({
  submitterName: z.string().min(1).max(120),
  submitterEmail: z.string().email().nullable().optional().or(z.literal("")).optional(),
  submissionUrl: z.string().url(),
  loomUrl: z.string().url().nullable().optional().or(z.literal("")).optional(),
  description: z.string().max(2000).nullable().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const json = await req.json();
  const parsed = submitSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [comp] = await db
    .select({
      id: competitionsTable.id,
      status: competitionsTable.status,
      deadline: competitionsTable.deadline,
    })
    .from(competitionsTable)
    .where(eq(competitionsTable.publicSlug, slug))
    .limit(1);
  if (!comp) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (comp.status === "closed") {
    return NextResponse.json({ error: "competition is closed" }, { status: 400 });
  }
  if (new Date(comp.deadline).getTime() < Date.now()) {
    return NextResponse.json({ error: "deadline has passed" }, { status: 400 });
  }

  const threadToken = nanoid(24);
  const [submission] = await db
    .insert(competitionSubmissionsTable)
    .values({
      competitionId: comp.id,
      submitterName: parsed.data.submitterName,
      submitterEmail: parsed.data.submitterEmail || null,
      submissionUrl: parsed.data.submissionUrl,
      loomUrl: parsed.data.loomUrl || null,
      description: parsed.data.description || null,
      threadToken,
    })
    .returning();

  return NextResponse.json({ threadToken, submissionId: submission.id });
}
