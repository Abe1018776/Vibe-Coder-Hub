import { NextRequest, NextResponse } from "next/server";
import {
  db,
  gigConversationsTable,
  gigMessagesTable,
} from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";

const sendSchema = z.object({
  content: z.string().min(1),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const [conv] = await db
    .select()
    .from(gigConversationsTable)
    .where(eq(gigConversationsTable.threadToken, token))
    .limit(1);
  if (!conv) return NextResponse.json({ error: "not found" }, { status: 404 });

  const messages = await db
    .select()
    .from(gigMessagesTable)
    .where(eq(gigMessagesTable.conversationId, conv.id))
    .orderBy(asc(gigMessagesTable.createdAt));

  return NextResponse.json({ conversation: conv, messages });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const json = await req.json();
  const parsed = sendSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [conv] = await db
    .select({ id: gigConversationsTable.id })
    .from(gigConversationsTable)
    .where(eq(gigConversationsTable.threadToken, token))
    .limit(1);
  if (!conv) return NextResponse.json({ error: "not found" }, { status: 404 });

  const [msg] = await db
    .insert(gigMessagesTable)
    .values({
      conversationId: conv.id,
      senderType: "freelancer",
      content: parsed.data.content,
    })
    .returning();

  return NextResponse.json(msg, { status: 201 });
}
