import { NextRequest, NextResponse } from "next/server";
import {
  db,
  showcaseProjectsTable,
  showcaseUpvotesTable,
} from "@/lib/db";
import { eq, sql, and } from "drizzle-orm";
import { requireUser } from "@/lib/auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response, userId } = await requireUser();
  if (response) return response;

  const { id } = await params;
  const pid = Number(id);
  if (!pid) return NextResponse.json({ error: "bad id" }, { status: 400 });

  const [existing] = await db
    .select({ id: showcaseUpvotesTable.id })
    .from(showcaseUpvotesTable)
    .where(
      and(
        eq(showcaseUpvotesTable.projectId, pid),
        eq(showcaseUpvotesTable.userId, userId),
      ),
    )
    .limit(1);

  if (existing) {
    return NextResponse.json({ error: "already upvoted" }, { status: 409 });
  }

  await db.insert(showcaseUpvotesTable).values({
    projectId: pid,
    userId,
  });

  const [updated] = await db
    .update(showcaseProjectsTable)
    .set({ upvotes: sql`${showcaseProjectsTable.upvotes} + 1` })
    .where(eq(showcaseProjectsTable.id, pid))
    .returning();
  if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(updated);
}
