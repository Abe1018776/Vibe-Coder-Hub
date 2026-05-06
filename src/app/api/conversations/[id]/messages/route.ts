import { NextRequest, NextResponse } from "next/server";
import { db, gigMessagesTable, gigConversationsTable } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const sendSchema = z.object({
  content: z.string().min(1),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response } = await requireUser();
  if (response) return response;

  const { id } = await params;
  const convId = Number(id);
  if (!convId) return NextResponse.json({ error: "bad id" }, { status: 400 });

  const messages = await db
    .select()
    .from(gigMessagesTable)
    .where(eq(gigMessagesTable.conversationId, convId))
    .orderBy(asc(gigMessagesTable.createdAt));

  return NextResponse.json(messages);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response } = await requireUser();
  if (response) return response;

  const { id } = await params;
  const convId = Number(id);
  if (!convId) return NextResponse.json({ error: "bad id" }, { status: 400 });

  const json = await req.json();
  const parsed = sendSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [exists] = await db
    .select({ id: gigConversationsTable.id })
    .from(gigConversationsTable)
    .where(eq(gigConversationsTable.id, convId))
    .limit(1);
  if (!exists) return NextResponse.json({ error: "not found" }, { status: 404 });

  const [msg] = await db
    .insert(gigMessagesTable)
    .values({
      conversationId: convId,
      senderType: "poster",
      content: parsed.data.content,
    })
    .returning();

  return NextResponse.json(msg, { status: 201 });
}
