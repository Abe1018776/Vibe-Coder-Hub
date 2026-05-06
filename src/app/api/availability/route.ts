import { NextRequest, NextResponse } from "next/server";
import { db, availabilitySlotsTable } from "@/lib/db";
import { desc } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const schema = z.object({
  freelancerId: z.number().int(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  durationHours: z.number().positive(),
  hourlyRate: z.number().nullable().optional(),
  workType: z.enum(["troubleshooting", "coworking", "build", "any"]),
  notes: z.string().nullable().optional(),
});

export async function GET() {
  const rows = await db
    .select()
    .from(availabilitySlotsTable)
    .orderBy(desc(availabilitySlotsTable.date));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { response } = await requireUser();
  if (response) return response;
  const json = await req.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;
  const [created] = await db
    .insert(availabilitySlotsTable)
    .values({
      freelancerId: d.freelancerId,
      date: d.date,
      startTime: d.startTime,
      endTime: d.endTime,
      durationHours: d.durationHours,
      hourlyRate: d.hourlyRate ?? null,
      workType: d.workType,
      notes: d.notes ?? null,
    })
    .returning();
  return NextResponse.json(created, { status: 201 });
}
