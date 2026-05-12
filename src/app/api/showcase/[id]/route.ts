import { NextRequest, NextResponse } from "next/server";
import {
  db,
  showcaseProjectsTable,
  showcaseCommentsTable,
} from "@/lib/db";
import { eq, desc, asc } from "drizzle-orm";
import { z } from "zod";
import { requireUser, getAdminContext } from "@/lib/auth";

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  url: z.string().url().nullable().optional().or(z.literal("")).optional(),
  imageUrl: z.string().url().nullable().optional().or(z.literal("")).optional(),
  videoUrl: z.string().url().nullable().optional().or(z.literal("")).optional(),
  builderName: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional(),
});

const commentSchema = z.object({
  content: z.string().min(1).max(500),
  userName: z.string().min(1),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const pid = Number(id);
  if (!pid) return NextResponse.json({ error: "bad id" }, { status: 400 });

  const comments = await db
    .select()
    .from(showcaseCommentsTable)
    .where(eq(showcaseCommentsTable.projectId, pid))
    .orderBy(asc(showcaseCommentsTable.createdAt));

  return NextResponse.json(comments);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response, userId } = await requireUser();
  if (response) return response;

  const { id } = await params;
  const pid = Number(id);
  if (!pid) return NextResponse.json({ error: "bad id" }, { status: 400 });

  const json = await req.json();
  const parsed = commentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [project] = await db
    .select({ id: showcaseProjectsTable.id })
    .from(showcaseProjectsTable)
    .where(eq(showcaseProjectsTable.id, pid))
    .limit(1);
  if (!project) return NextResponse.json({ error: "not found" }, { status: 404 });

  const [comment] = await db
    .insert(showcaseCommentsTable)
    .values({
      projectId: pid,
      userId,
      userName: parsed.data.userName,
      content: parsed.data.content,
    })
    .returning();

  return NextResponse.json(comment, { status: 201 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId, isAdmin } = await getAdminContext();
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const pid = Number(id);
  if (!pid) return NextResponse.json({ error: "bad id" }, { status: 400 });

  const [project] = await db
    .select({ createdBy: showcaseProjectsTable.createdBy })
    .from(showcaseProjectsTable)
    .where(eq(showcaseProjectsTable.id, pid))
    .limit(1);
  if (!project) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (project.createdBy !== userId && !isAdmin)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const json = await req.json();
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updates: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
  if ("url" in updates) updates.url = updates.url || null;
  if ("imageUrl" in updates) updates.imageUrl = updates.imageUrl || null;
  if ("videoUrl" in updates) updates.videoUrl = updates.videoUrl || null;

  const [updated] = await db
    .update(showcaseProjectsTable)
    .set(updates)
    .where(eq(showcaseProjectsTable.id, pid))
    .returning();
  if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId, isAdmin } = await getAdminContext();
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const pid = Number(id);
  if (!pid) return NextResponse.json({ error: "bad id" }, { status: 400 });

  const [project] = await db
    .select({ createdBy: showcaseProjectsTable.createdBy })
    .from(showcaseProjectsTable)
    .where(eq(showcaseProjectsTable.id, pid))
    .limit(1);
  if (!project) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (project.createdBy !== userId && !isAdmin)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  await db.delete(showcaseProjectsTable).where(eq(showcaseProjectsTable.id, pid));
  return NextResponse.json({ ok: true });
}
