import { NextRequest, NextResponse } from "next/server";
import { db, tagsTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response } = await requireUser();
  if (response) return response;
  const { id } = await params;
  const tid = Number(id);
  if (!tid) return NextResponse.json({ error: "bad id" }, { status: 400 });
  await db.delete(tagsTable).where(eq(tagsTable.id, tid));
  return NextResponse.json({ ok: true });
}
