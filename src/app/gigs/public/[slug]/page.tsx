import { notFound } from "next/navigation";
import { db, gigsTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import GigPublicClient from "./_client";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function GigPublicPage({ params }: Props) {
  const { slug } = await params;
  const [gig] = await db
    .select()
    .from(gigsTable)
    .where(eq(gigsTable.publicSlug, slug))
    .limit(1);

  if (!gig) notFound();

  return <GigPublicClient gig={gig} slug={slug} />;
}
