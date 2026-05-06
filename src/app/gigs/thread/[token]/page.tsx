import { notFound } from "next/navigation";
import { db, gigConversationsTable, gigMessagesTable, gigsTable } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import ThreadClient from "./_client";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function ThreadPage({ params }: Props) {
  const { token } = await params;

  const [convo] = await db
    .select({
      conv: gigConversationsTable,
      gig: gigsTable,
    })
    .from(gigConversationsTable)
    .innerJoin(gigsTable, eq(gigConversationsTable.gigId, gigsTable.id))
    .where(eq(gigConversationsTable.threadToken, token))
    .limit(1);

  if (!convo) notFound();

  const messages = await db
    .select()
    .from(gigMessagesTable)
    .where(eq(gigMessagesTable.conversationId, convo.conv.id))
    .orderBy(asc(gigMessagesTable.createdAt));

  return (
    <ThreadClient
      token={token}
      gigTitle={convo.gig.title}
      gigSlug={convo.gig.publicSlug}
      freelancerName={convo.conv.freelancerName}
      initialMessages={messages}
    />
  );
}
