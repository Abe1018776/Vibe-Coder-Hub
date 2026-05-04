import { Router } from "express";
import { db } from "@workspace/db";
import { tagsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { CreateTagBody, DeleteTagParams } from "@workspace/api-zod";

const router = Router();

function tagToResponse(t: typeof tagsTable.$inferSelect) {
  return {
    id: t.id,
    name: t.name,
    category: t.category,
    createdAt: t.createdAt.toISOString(),
  };
}

// GET /tags
router.get("/tags", async (_req, res) => {
  const tags = await db.select().from(tagsTable).orderBy(tagsTable.category, tagsTable.name);
  res.json(tags.map(tagToResponse));
});

// POST /tags
router.post("/tags", async (req, res) => {
  const parsed = CreateTagBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const [tag] = await db.insert(tagsTable).values(parsed.data).returning();
  res.status(201).json(tagToResponse(tag));
});

// DELETE /tags/:id
router.delete("/tags/:id", async (req, res) => {
  const parsed = DeleteTagParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(tagsTable).where(eq(tagsTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
