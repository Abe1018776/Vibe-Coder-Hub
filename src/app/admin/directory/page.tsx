import Link from "next/link";
import { db, professionalsTable } from "@/lib/db";
import { desc } from "drizzle-orm";
import { Plus, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import DirectoryAdminClient from "./_client";

export const dynamic = "force-dynamic";

export default async function AdminDirectoryPage() {
  const rows = await db
    .select()
    .from(professionalsTable)
    .orderBy(desc(professionalsTable.createdAt));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Briefcase size={18} /> Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {rows.length} professional{rows.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/admin/directory/new">
          <Button size="sm">
            <Plus size={14} /> Add Professional
          </Button>
        </Link>
      </div>

      <DirectoryAdminClient initial={rows} />
    </div>
  );
}
