import { Router } from "express";
import { db } from "@workspace/db";
import { freelancersTable, availabilitySlotsTable } from "@workspace/db";
import { eq, sql, and, arrayContains, ilike, or } from "drizzle-orm";
import {
  CreateFreelancerBody,
  UpdateFreelancerBody,
  ListFreelancersQueryParams,
  GetFreelancerParams,
  UpdateFreelancerParams,
  DeleteFreelancerParams,
} from "@workspace/api-zod";

const router = Router();

function freelancerToResponse(f: typeof freelancersTable.$inferSelect) {
  return {
    id: f.id,
    name: f.name,
    bio: f.bio ?? null,
    avatarPath: f.avatarPath ?? null,
    skills: f.skills ?? [],
    tags: f.tags ?? [],
    hourlyRate: f.hourlyRate ?? null,
    portfolioLinks: f.portfolioLinks ?? [],
    contactInfo: f.contactInfo ?? null,
    notes: f.notes ?? null,
    tools: f.tools ?? [],
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
  };
}

// GET /freelancers
router.get("/freelancers", async (req, res) => {
  const parsed = ListFreelancersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { tag, search } = parsed.data;

  const conditions = [];
  if (tag) conditions.push(arrayContains(freelancersTable.tags, [tag]));
  if (search) conditions.push(or(
    ilike(freelancersTable.name, `%${search}%`),
    ilike(freelancersTable.bio, `%${search}%`),
  ));

  const freelancers = conditions.length
    ? await db.select().from(freelancersTable).where(and(...conditions)).orderBy(sql`${freelancersTable.createdAt} DESC`)
    : await db.select().from(freelancersTable).orderBy(sql`${freelancersTable.createdAt} DESC`);

  res.json(freelancers.map(freelancerToResponse));
});

// POST /freelancers
router.post("/freelancers", async (req, res) => {
  const parsed = CreateFreelancerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const [freelancer] = await db.insert(freelancersTable).values({
    name: parsed.data.name,
    bio: parsed.data.bio ?? null,
    avatarPath: parsed.data.avatarPath ?? null,
    skills: parsed.data.skills ?? [],
    tags: parsed.data.tags ?? [],
    hourlyRate: parsed.data.hourlyRate ?? null,
    portfolioLinks: parsed.data.portfolioLinks ?? [],
    contactInfo: parsed.data.contactInfo ?? null,
    notes: parsed.data.notes ?? null,
    tools: parsed.data.tools ?? [],
  }).returning();

  res.status(201).json(freelancerToResponse(freelancer));
});

// GET /freelancers/:id
router.get("/freelancers/:id", async (req, res) => {
  const parsed = GetFreelancerParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [freelancer] = await db.select().from(freelancersTable).where(eq(freelancersTable.id, parsed.data.id));
  if (!freelancer) {
    res.status(404).json({ error: "Freelancer not found" });
    return;
  }

  res.json(freelancerToResponse(freelancer));
});

// PUT /freelancers/:id
router.put("/freelancers/:id", async (req, res) => {
  const paramParsed = UpdateFreelancerParams.safeParse({ id: Number(req.params.id) });
  const bodyParsed = UpdateFreelancerBody.safeParse(req.body);
  if (!paramParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const updates: Partial<typeof freelancersTable.$inferInsert> = {};
  const b = bodyParsed.data;
  if (b.name !== undefined) updates.name = b.name;
  if (b.bio !== undefined) updates.bio = b.bio ?? null;
  if (b.avatarPath !== undefined) updates.avatarPath = b.avatarPath ?? null;
  if (b.skills !== undefined) updates.skills = b.skills;
  if (b.tags !== undefined) updates.tags = b.tags;
  if (b.hourlyRate !== undefined) updates.hourlyRate = b.hourlyRate ?? null;
  if (b.portfolioLinks !== undefined) updates.portfolioLinks = b.portfolioLinks;
  if (b.contactInfo !== undefined) updates.contactInfo = b.contactInfo ?? null;
  if (b.notes !== undefined) updates.notes = b.notes ?? null;
  if (b.tools !== undefined) updates.tools = b.tools;
  updates.updatedAt = new Date();

  const [freelancer] = await db.update(freelancersTable).set(updates).where(eq(freelancersTable.id, paramParsed.data.id)).returning();
  if (!freelancer) {
    res.status(404).json({ error: "Freelancer not found" });
    return;
  }

  res.json(freelancerToResponse(freelancer));
});

// DELETE /freelancers/:id
router.delete("/freelancers/:id", async (req, res) => {
  const parsed = DeleteFreelancerParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(freelancersTable).where(eq(freelancersTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
