import { notFound } from "next/navigation";
import { db, freelancersTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import EditFreelancerClient from "./_client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditFreelancerPage({ params }: Props) {
  const { id } = await params;
  const fid = Number(id);
  if (!fid) notFound();

  const [freelancer] = await db
    .select()
    .from(freelancersTable)
    .where(eq(freelancersTable.id, fid))
    .limit(1);
  if (!freelancer) notFound();

  return <EditFreelancerClient freelancer={freelancer} />;
}
