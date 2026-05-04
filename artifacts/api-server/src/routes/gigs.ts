import { Router, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import {
  gigsTable,
  gigRepliesTable,
  gigConversationsTable,
} from "@workspace/db";
import { eq, sql, and, arrayContains } from "drizzle-orm";
import {
  CreateGigBody,
  UpdateGigBody,
  ListGigsQueryParams,
  GetGigParams,
  UpdateGigParams,
  DeleteGigParams,
  ListGigRepliesParams,
  CreateGigReplyParams,
  CreateGigReplyBody,
  DeleteGigReplyParams,
} from "@workspace/api-zod";
import { getAuth } from "@clerk/express";
import { nanoid } from "nanoid";

const router = Router();

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

function gigToResponse(gig: typeof gigsTable.$inferSelect, replyCount = 0) {
  return {
    id: gig.id,
    title: gig.title,
    description: gig.description,
    type: gig.type,
    status: gig.status,
    tags: gig.tags ?? [],
    requirements: gig.requirements ?? null,
    budgetMin: gig.budgetMin ?? null,
    budgetMax: gig.budgetMax ?? null,
    hourlyRate: gig.hourlyRate ?? null,
    recordingPath: gig.recordingPath ?? null,
    publicSlug: gig.publicSlug,
    replyCount,
    createdAt: gig.createdAt.toISOString(),
    updatedAt: gig.updatedAt.toISOString(),
  };
}

// GET /gigs
router.get("/gigs", async (req, res) => {
  const parsed = ListGigsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { type, tag, status } = parsed.data;

  const conditions = [];
  if (type) conditions.push(eq(gigsTable.type, type));
  if (status) conditions.push(eq(gigsTable.status, status));
  if (tag) conditions.push(arrayContains(gigsTable.tags, [tag]));

  const gigs = conditions.length
    ? await db.select().from(gigsTable).where(and(...conditions)).orderBy(sql`${gigsTable.createdAt} DESC`)
    : await db.select().from(gigsTable).orderBy(sql`${gigsTable.createdAt} DESC`);

  // Count applicants (gig_conversations) per gig — this is now the primary applicant count
  const convCounts = await db
    .select({ gigId: gigConversationsTable.gigId, count: sql<number>`count(*)::int` })
    .from(gigConversationsTable)
    .groupBy(gigConversationsTable.gigId);
  const countMap = new Map(convCounts.map((r) => [r.gigId, r.count]));

  res.json(gigs.map((g) => gigToResponse(g, countMap.get(g.id) ?? 0)));
});

// POST /gigs
router.post("/gigs", async (req, res) => {
  const parsed = CreateGigBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { title, description, type, tags, requirements, budgetMin, budgetMax, hourlyRate, recordingPath } = parsed.data;

  const [gig] = await db.insert(gigsTable).values({
    title,
    description,
    type,
    tags: tags ?? [],
    requirements: requirements ?? null,
    budgetMin: budgetMin ?? null,
    budgetMax: budgetMax ?? null,
    hourlyRate: hourlyRate ?? null,
    recordingPath: recordingPath ?? null,
    publicSlug: nanoid(10),
    status: "open",
  }).returning();

  res.status(201).json(gigToResponse(gig, 0));
});

// GET /gigs/public/:slug — no auth, returns gig by public slug
router.get("/gigs/public/:slug", async (req, res) => {
  const [gig] = await db.select().from(gigsTable).where(eq(gigsTable.publicSlug, req.params.slug));
  if (!gig) {
    res.status(404).json({ error: "Gig not found" });
    return;
  }
  const [convRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(gigConversationsTable)
    .where(eq(gigConversationsTable.gigId, gig.id));
  res.json(gigToResponse(gig, convRow?.count ?? 0));
});

// GET /gigs/:id
router.get("/gigs/:id", async (req, res) => {
  const parsed = GetGigParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [gig] = await db.select().from(gigsTable).where(eq(gigsTable.id, parsed.data.id));
  if (!gig) {
    res.status(404).json({ error: "Gig not found" });
    return;
  }

  const [convRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(gigConversationsTable)
    .where(eq(gigConversationsTable.gigId, gig.id));

  res.json(gigToResponse(gig, convRow?.count ?? 0));
});

// PUT /gigs/:id
router.put("/gigs/:id", async (req, res) => {
  const paramParsed = UpdateGigParams.safeParse({ id: Number(req.params.id) });
  const bodyParsed = UpdateGigBody.safeParse(req.body);
  if (!paramParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const updates: Partial<typeof gigsTable.$inferInsert> = {};
  const b = bodyParsed.data;
  if (b.title !== undefined) updates.title = b.title;
  if (b.description !== undefined) updates.description = b.description;
  if (b.type !== undefined) updates.type = b.type;
  if (b.status !== undefined) updates.status = b.status;
  if (b.tags !== undefined) updates.tags = b.tags;
  if (b.requirements !== undefined) updates.requirements = b.requirements ?? null;
  if (b.budgetMin !== undefined) updates.budgetMin = b.budgetMin ?? null;
  if (b.budgetMax !== undefined) updates.budgetMax = b.budgetMax ?? null;
  if (b.hourlyRate !== undefined) updates.hourlyRate = b.hourlyRate ?? null;
  if (b.recordingPath !== undefined) updates.recordingPath = b.recordingPath ?? null;
  updates.updatedAt = new Date();

  const [gig] = await db.update(gigsTable).set(updates).where(eq(gigsTable.id, paramParsed.data.id)).returning();
  if (!gig) {
    res.status(404).json({ error: "Gig not found" });
    return;
  }

  const [convRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(gigConversationsTable)
    .where(eq(gigConversationsTable.gigId, gig.id));

  res.json(gigToResponse(gig, convRow?.count ?? 0));
});

// DELETE /gigs/:id
router.delete("/gigs/:id", async (req, res) => {
  const parsed = DeleteGigParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(gigsTable).where(eq(gigsTable.id, parsed.data.id));
  res.status(204).send();
});

// GET /gigs/:id/replies — auth required, internal read of legacy flat replies
router.get("/gigs/:id/replies", requireAuth, async (req, res) => {
  const parsed = ListGigRepliesParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const replies = await db
    .select()
    .from(gigRepliesTable)
    .where(eq(gigRepliesTable.gigId, parsed.data.id))
    .orderBy(sql`${gigRepliesTable.createdAt} DESC`);

  res.json(replies.map((r) => ({
    id: r.id,
    gigId: r.gigId,
    senderName: r.senderName,
    message: r.message ?? null,
    voiceNotePath: r.voiceNotePath ?? null,
    createdAt: r.createdAt.toISOString(),
  })));
});

// POST /gigs/:id/replies — auth required, internal-only legacy endpoint
router.post("/gigs/:id/replies", requireAuth, async (req, res) => {
  const paramParsed = CreateGigReplyParams.safeParse({ id: Number(req.params.id) });
  const bodyParsed = CreateGigReplyBody.safeParse(req.body);
  if (!paramParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const [gig] = await db.select().from(gigsTable).where(eq(gigsTable.id, paramParsed.data.id));
  if (!gig) {
    res.status(404).json({ error: "Gig not found" });
    return;
  }

  const [reply] = await db.insert(gigRepliesTable).values({
    gigId: paramParsed.data.id,
    senderName: bodyParsed.data.senderName,
    message: bodyParsed.data.message ?? null,
    voiceNotePath: bodyParsed.data.voiceNotePath ?? null,
  }).returning();

  res.status(201).json({
    id: reply.id,
    gigId: reply.gigId,
    senderName: reply.senderName,
    message: reply.message ?? null,
    voiceNotePath: reply.voiceNotePath ?? null,
    createdAt: reply.createdAt.toISOString(),
  });
});

// DELETE /gig-replies/:id — auth required
router.delete("/gig-replies/:id", requireAuth, async (req, res) => {
  const parsed = DeleteGigReplyParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(gigRepliesTable).where(eq(gigRepliesTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
