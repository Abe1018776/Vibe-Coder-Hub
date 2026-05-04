import { Router } from "express";
import { db } from "@workspace/db";
import { availabilitySlotsTable, freelancersTable } from "@workspace/db";
import { eq, sql, and, gte, lte } from "drizzle-orm";
import {
  CreateAvailabilitySlotBody,
  UpdateAvailabilitySlotBody,
  ListAvailabilitySlotsQueryParams,
  UpdateAvailabilitySlotParams,
  DeleteAvailabilitySlotParams,
} from "@workspace/api-zod";

const router = Router();

function slotToResponse(slot: typeof availabilitySlotsTable.$inferSelect, freelancerName: string) {
  return {
    id: slot.id,
    freelancerId: slot.freelancerId,
    freelancerName,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    durationHours: slot.durationHours,
    hourlyRate: slot.hourlyRate ?? null,
    workType: slot.workType,
    notes: slot.notes ?? null,
    isBooked: slot.isBooked,
    bookedByNote: slot.bookedByNote ?? null,
    createdAt: slot.createdAt.toISOString(),
  };
}

// GET /availability
router.get("/availability", async (req, res) => {
  const parsed = ListAvailabilitySlotsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { freelancerId, from, to, booked } = parsed.data;

  const conditions = [];
  if (freelancerId) conditions.push(eq(availabilitySlotsTable.freelancerId, freelancerId));
  if (from) conditions.push(gte(availabilitySlotsTable.date, from));
  if (to) conditions.push(lte(availabilitySlotsTable.date, to));
  if (booked !== undefined) conditions.push(eq(availabilitySlotsTable.isBooked, booked));

  const slots = conditions.length
    ? await db.select({ slot: availabilitySlotsTable, freelancer: freelancersTable })
        .from(availabilitySlotsTable)
        .leftJoin(freelancersTable, eq(availabilitySlotsTable.freelancerId, freelancersTable.id))
        .where(and(...conditions))
        .orderBy(availabilitySlotsTable.date, availabilitySlotsTable.startTime)
    : await db.select({ slot: availabilitySlotsTable, freelancer: freelancersTable })
        .from(availabilitySlotsTable)
        .leftJoin(freelancersTable, eq(availabilitySlotsTable.freelancerId, freelancersTable.id))
        .orderBy(availabilitySlotsTable.date, availabilitySlotsTable.startTime);

  res.json(slots.map(({ slot, freelancer }) => slotToResponse(slot, freelancer?.name ?? "Unknown")));
});

// POST /availability
router.post("/availability", async (req, res) => {
  const parsed = CreateAvailabilitySlotBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const [freelancer] = await db.select().from(freelancersTable).where(eq(freelancersTable.id, parsed.data.freelancerId));
  if (!freelancer) {
    res.status(404).json({ error: "Freelancer not found" });
    return;
  }

  const [slot] = await db.insert(availabilitySlotsTable).values({
    freelancerId: parsed.data.freelancerId,
    date: parsed.data.date,
    startTime: parsed.data.startTime,
    endTime: parsed.data.endTime,
    durationHours: parsed.data.durationHours,
    hourlyRate: parsed.data.hourlyRate ?? null,
    workType: parsed.data.workType,
    notes: parsed.data.notes ?? null,
    isBooked: false,
  }).returning();

  res.status(201).json(slotToResponse(slot, freelancer.name));
});

// PUT /availability/:id
router.put("/availability/:id", async (req, res) => {
  const paramParsed = UpdateAvailabilitySlotParams.safeParse({ id: Number(req.params.id) });
  const bodyParsed = UpdateAvailabilitySlotBody.safeParse(req.body);
  if (!paramParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const updates: Partial<typeof availabilitySlotsTable.$inferInsert> = {};
  const b = bodyParsed.data;
  if (b.isBooked !== undefined) updates.isBooked = b.isBooked;
  if (b.bookedByNote !== undefined) updates.bookedByNote = b.bookedByNote ?? null;
  if (b.hourlyRate !== undefined) updates.hourlyRate = b.hourlyRate ?? null;
  if (b.notes !== undefined) updates.notes = b.notes ?? null;

  const [slot] = await db.update(availabilitySlotsTable).set(updates).where(eq(availabilitySlotsTable.id, paramParsed.data.id)).returning();
  if (!slot) {
    res.status(404).json({ error: "Slot not found" });
    return;
  }

  const [freelancer] = await db.select().from(freelancersTable).where(eq(freelancersTable.id, slot.freelancerId));
  res.json(slotToResponse(slot, freelancer?.name ?? "Unknown"));
});

// DELETE /availability/:id
router.delete("/availability/:id", async (req, res) => {
  const parsed = DeleteAvailabilitySlotParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(availabilitySlotsTable).where(eq(availabilitySlotsTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
