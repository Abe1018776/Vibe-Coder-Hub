import { NextRequest, NextResponse } from "next/server";
import {
  db,
  gigsTable,
  gigConversationsTable,
  gigMessagesTable,
} from "@/lib/db";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";

const applySchema = z.object({
  freelancerName: z.string().min(1),
  freelancerEmail: z.string().email().nullable().optional(),
  message: z.string().nullable().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const json = await req.json();
  const parsed = applySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [gig] = await db
    .select({ id: gigsTable.id })
    .from(gigsTable)
    .where(eq(gigsTable.publicSlug, slug))
    .limit(1);
  if (!gig) return NextResponse.json({ error: "not found" }, { status: 404 });

  const threadToken = nanoid(24);
  const [conv] = await db
    .insert(gigConversationsTable)
    .values({
      gigId: gig.id,
      freelancerName: parsed.data.freelancerName,
      freelancerEmail: parsed.data.freelancerEmail ?? null,
      threadToken,
    })
    .returning();

  if (parsed.data.message) {
    await db.insert(gigMessagesTable).values({
      conversationId: conv.id,
      senderType: "freelancer",
      content: parsed.data.message,
    });
  }

  return NextResponse.json({ threadToken, conversationId: conv.id });
}
