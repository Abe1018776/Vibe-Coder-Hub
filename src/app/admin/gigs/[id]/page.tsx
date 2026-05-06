import { notFound } from "next/navigation";
import {
  db,
  gigsTable,
  gigConversationsTable,
  gigMessagesTable,
} from "@/lib/db";
import { eq, asc, desc } from "drizzle-orm";
import GigDetailClient from "./_client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GigDetailPage({ params }: Props) {
  const { id } = await params;
  const gigId = Number(id);
  if (!gigId) notFound();

  const [gig] = await db
    .select()
    .from(gigsTable)
    .where(eq(gigsTable.id, gigId))
    .limit(1);
  if (!gig) notFound();

  const conversations = await db
    .select()
    .from(gigConversationsTable)
    .where(eq(gigConversationsTable.gigId, gigId))
    .orderBy(desc(gigConversationsTable.createdAt));

  const conversationIds = conversations.map((c) => c.id);
  const messagesByConv = new Map<number, Awaited<ReturnType<typeof loadMessages>>>();

  async function loadMessages(convId: number) {
    return db
      .select()
      .from(gigMessagesTable)
      .where(eq(gigMessagesTable.conversationId, convId))
      .orderBy(asc(gigMessagesTable.createdAt));
  }

  await Promise.all(
    conversationIds.map(async (cid) => {
      messagesByConv.set(cid, await loadMessages(cid));
    }),
  );

  const conversationsWithMessages = conversations.map((c) => ({
    ...c,
    messages: messagesByConv.get(c.id) ?? [],
  }));

  return <GigDetailClient gig={gig} conversations={conversationsWithMessages} />;
}
