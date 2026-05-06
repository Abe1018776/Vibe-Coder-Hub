import { NextRequest, NextResponse } from "next/server";
import { db, showcaseProjectsTable } from "@/lib/db";
import { eq, sql } from "drizzle-orm";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const pid = Number(id);
  if (!pid) return NextResponse.json({ error: "bad id" }, { status: 400 });

  const [updated] = await db
    .update(showcaseProjectsTable)
    .set({ upvotes: sql`${showcaseProjectsTable.upvotes} + 1` })
    .where(eq(showcaseProjectsTable.id, pid))
    .returning();
  if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(updated);
}
