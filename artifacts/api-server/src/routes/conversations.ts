import { Router, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import {
  gigsTable,
  gigConversationsTable,
  gigMessagesTable,
} from "@workspace/db";
import { eq, asc, desc } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { nanoid } from "nanoid";
import { z } from "zod/v4";

const router = Router();

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

function messageToResponse(m: typeof gigMessagesTable.$inferSelect) {
  return {
    id: m.id,
    conversationId: m.conversationId,
    senderType: m.senderType,
    content: m.content ?? null,
    voiceNotePath: m.voiceNotePath ?? null,
    createdAt: m.createdAt.toISOString(),
  };
}

function conversationToResponse(
  c: typeof gigConversationsTable.$inferSelect,
  messages: typeof gigMessagesTable.$inferSelect[],
) {
  return {
    id: c.id,
    gigId: c.gigId,
    freelancerName: c.freelancerName,
    freelancerEmail: c.freelancerEmail ?? null,
    threadToken: c.threadToken,
    createdAt: c.createdAt.toISOString(),
    messages: messages.map(messageToResponse),
  };
}

// POST /api/gigs/public/:slug/apply — no auth, creates conversation + first message
router.post("/gigs/public/:slug/apply", async (req, res) => {
  const ApplyBody = z.object({
    freelancerName: z.string().min(1, "Name required"),
    freelancerEmail: z.string().email().optional(),
    message: z.string().optional(),
    voiceNotePath: z.string().optional(),
  }).refine(
    (d) => (d.message && d.message.trim().length > 0) || (d.voiceNotePath && d.voiceNotePath.trim().length > 0),
    { message: "Application must include a message or voice note" },
  );
  const parsed = ApplyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const [gig] = await db.select().from(gigsTable).where(eq(gigsTable.publicSlug, req.params.slug));
  if (!gig) {
    res.status(404).json({ error: "Gig not found" });
    return;
  }

  const threadToken = nanoid(16);
  const [conversation] = await db.insert(gigConversationsTable).values({
    gigId: gig.id,
    freelancerName: parsed.data.freelancerName,
    freelancerEmail: parsed.data.freelancerEmail ?? null,
    threadToken,
  }).returning();

  const [message] = await db.insert(gigMessagesTable).values({
    conversationId: conversation.id,
    senderType: "freelancer",
    content: parsed.data.message ?? null,
    voiceNotePath: parsed.data.voiceNotePath ?? null,
  }).returning();

  res.status(201).json({
    threadToken,
    conversationId: conversation.id,
    message: messageToResponse(message),
  });
});

// GET /api/thread/:token — no auth, freelancer views their thread
router.get("/thread/:token", async (req, res) => {
  const [conversation] = await db
    .select()
    .from(gigConversationsTable)
    .where(eq(gigConversationsTable.threadToken, req.params.token));
  if (!conversation) {
    res.status(404).json({ error: "Thread not found" });
    return;
  }

  const messages = await db
    .select()
    .from(gigMessagesTable)
    .where(eq(gigMessagesTable.conversationId, conversation.id))
    .orderBy(asc(gigMessagesTable.createdAt));

  const [gig] = await db.select({ title: gigsTable.title, publicSlug: gigsTable.publicSlug })
    .from(gigsTable)
    .where(eq(gigsTable.id, conversation.gigId));

  res.json({
    ...conversationToResponse(conversation, messages),
    gigTitle: gig?.title ?? null,
    gigSlug: gig?.publicSlug ?? null,
  });
});

// POST /api/thread/:token/messages — no auth, freelancer sends a follow-up
router.post("/thread/:token/messages", async (req, res) => {
  const Body = z.object({
    content: z.string().optional(),
    voiceNotePath: z.string().optional(),
  }).refine(
    (d) => (d.content && d.content.trim().length > 0) || (d.voiceNotePath && d.voiceNotePath.trim().length > 0),
    { message: "Message must include text or a voice note" },
  );
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const [conversation] = await db
    .select()
    .from(gigConversationsTable)
    .where(eq(gigConversationsTable.threadToken, req.params.token));
  if (!conversation) {
    res.status(404).json({ error: "Thread not found" });
    return;
  }

  const [message] = await db.insert(gigMessagesTable).values({
    conversationId: conversation.id,
    senderType: "freelancer",
    content: parsed.data.content ?? null,
    voiceNotePath: parsed.data.voiceNotePath ?? null,
  }).returning();

  res.status(201).json(messageToResponse(message));
});

// GET /api/gigs/:id/conversations — auth required, poster lists conversations
router.get("/gigs/:id/conversations", requireAuth, async (req, res) => {
  const gigId = Number(req.params.id);
  if (!gigId) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const conversations = await db
    .select()
    .from(gigConversationsTable)
    .where(eq(gigConversationsTable.gigId, gigId))
    .orderBy(desc(gigConversationsTable.createdAt));

  const results = await Promise.all(
    conversations.map(async (c) => {
      const messages = await db
        .select()
        .from(gigMessagesTable)
        .where(eq(gigMessagesTable.conversationId, c.id))
        .orderBy(asc(gigMessagesTable.createdAt));
      return conversationToResponse(c, messages);
    }),
  );

  res.json(results);
});

// POST /api/conversations/:id/messages — auth required, poster sends a reply
router.post("/conversations/:id/messages", requireAuth, async (req, res) => {
  const conversationId = Number(req.params.id);
  if (!conversationId) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const Body = z.object({
    content: z.string().optional(),
    voiceNotePath: z.string().optional(),
  }).refine(
    (d) => (d.content && d.content.trim().length > 0) || (d.voiceNotePath && d.voiceNotePath.trim().length > 0),
    { message: "Reply must include text or a voice note" },
  );
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const [conversation] = await db
    .select()
    .from(gigConversationsTable)
    .where(eq(gigConversationsTable.id, conversationId));
  if (!conversation) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const [message] = await db.insert(gigMessagesTable).values({
    conversationId,
    senderType: "poster",
    content: parsed.data.content ?? null,
    voiceNotePath: parsed.data.voiceNotePath ?? null,
  }).returning();

  res.status(201).json(messageToResponse(message));
});

export default router;
