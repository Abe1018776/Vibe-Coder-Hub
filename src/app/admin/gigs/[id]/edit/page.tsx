import { notFound } from "next/navigation";
import { db, gigsTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import EditGigClient from "./_client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditGigPage({ params }: Props) {
  const { userId } = await auth();
  const { id } = await params;
  const gigId = Number(id);
  if (!gigId) notFound();

  const [gig] = await db
    .select()
    .from(gigsTable)
    .where(eq(gigsTable.id, gigId))
    .limit(1);
  if (!gig || gig.createdBy !== userId) notFound();

  return <EditGigClient gig={gig} />;
}
