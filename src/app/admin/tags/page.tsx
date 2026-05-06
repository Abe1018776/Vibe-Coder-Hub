import { db, tagsTable } from "@/lib/db";
import { asc } from "drizzle-orm";
import TagsClient from "./_client";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  const rows = await db.select().from(tagsTable).orderBy(asc(tagsTable.name));
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-1">Tags</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Manage the shared tag taxonomy.
      </p>
      <TagsClient initialTags={rows} />
    </div>
  );
}
