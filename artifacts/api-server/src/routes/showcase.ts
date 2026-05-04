import { Router } from "express";
import { db } from "@workspace/db";
import { showcaseProjectsTable } from "@workspace/db";
import { eq, sql, and, arrayContains } from "drizzle-orm";
import {
  CreateShowcaseProjectBody,
  UpdateShowcaseProjectBody,
  ListShowcaseProjectsQueryParams,
  GetShowcaseProjectParams,
  UpdateShowcaseProjectParams,
  DeleteShowcaseProjectParams,
  UpvoteShowcaseProjectParams,
} from "@workspace/api-zod";

const router = Router();

function projectToResponse(p: typeof showcaseProjectsTable.$inferSelect) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    url: p.url ?? null,
    screenshotPath: p.screenshotPath ?? null,
    tags: p.tags ?? [],
    tools: p.tools ?? [],
    builderName: p.builderName,
    upvotes: p.upvotes,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

// GET /showcase
router.get("/showcase", async (req, res) => {
  const parsed = ListShowcaseProjectsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { tag } = parsed.data;

  const projects = tag
    ? await db.select().from(showcaseProjectsTable).where(arrayContains(showcaseProjectsTable.tags, [tag])).orderBy(sql`${showcaseProjectsTable.upvotes} DESC`)
    : await db.select().from(showcaseProjectsTable).orderBy(sql`${showcaseProjectsTable.upvotes} DESC`);

  res.json(projects.map(projectToResponse));
});

// POST /showcase
router.post("/showcase", async (req, res) => {
  const parsed = CreateShowcaseProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const [project] = await db.insert(showcaseProjectsTable).values({
    name: parsed.data.name,
    description: parsed.data.description,
    url: parsed.data.url ?? null,
    screenshotPath: parsed.data.screenshotPath ?? null,
    tags: parsed.data.tags ?? [],
    tools: parsed.data.tools ?? [],
    builderName: parsed.data.builderName,
    upvotes: 0,
  }).returning();

  res.status(201).json(projectToResponse(project));
});

// GET /showcase/:id
router.get("/showcase/:id", async (req, res) => {
  const parsed = GetShowcaseProjectParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [project] = await db.select().from(showcaseProjectsTable).where(eq(showcaseProjectsTable.id, parsed.data.id));
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json(projectToResponse(project));
});

// PUT /showcase/:id
router.put("/showcase/:id", async (req, res) => {
  const paramParsed = UpdateShowcaseProjectParams.safeParse({ id: Number(req.params.id) });
  const bodyParsed = UpdateShowcaseProjectBody.safeParse(req.body);
  if (!paramParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const updates: Partial<typeof showcaseProjectsTable.$inferInsert> = {};
  const b = bodyParsed.data;
  if (b.name !== undefined) updates.name = b.name;
  if (b.description !== undefined) updates.description = b.description;
  if (b.url !== undefined) updates.url = b.url ?? null;
  if (b.screenshotPath !== undefined) updates.screenshotPath = b.screenshotPath ?? null;
  if (b.tags !== undefined) updates.tags = b.tags;
  if (b.tools !== undefined) updates.tools = b.tools;
  if (b.builderName !== undefined) updates.builderName = b.builderName;
  updates.updatedAt = new Date();

  const [project] = await db.update(showcaseProjectsTable).set(updates).where(eq(showcaseProjectsTable.id, paramParsed.data.id)).returning();
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json(projectToResponse(project));
});

// DELETE /showcase/:id
router.delete("/showcase/:id", async (req, res) => {
  const parsed = DeleteShowcaseProjectParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(showcaseProjectsTable).where(eq(showcaseProjectsTable.id, parsed.data.id));
  res.status(204).send();
});

// POST /showcase/:id/upvote
router.post("/showcase/:id/upvote", async (req, res) => {
  const parsed = UpvoteShowcaseProjectParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [project] = await db.update(showcaseProjectsTable)
    .set({ upvotes: sql`${showcaseProjectsTable.upvotes} + 1`, updatedAt: new Date() })
    .where(eq(showcaseProjectsTable.id, parsed.data.id))
    .returning();
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json(projectToResponse(project));
});

export default router;
