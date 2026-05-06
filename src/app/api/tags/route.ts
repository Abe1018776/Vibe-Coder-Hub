import { NextRequest, NextResponse } from "next/server";
import { db, tagsTable } from "@/lib/db";
import { asc } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1),
  category: z.enum(["tool", "skill", "gig_type", "general"]),
});

export async function GET() {
  const rows = await db.select().from(tagsTable).orderBy(asc(tagsTable.name));
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
  const [created] = await db
    .insert(tagsTable)
    .values(parsed.data)
    .onConflictDoNothing()
    .returning();
  return NextResponse.json(created ?? null, { status: 201 });
}
