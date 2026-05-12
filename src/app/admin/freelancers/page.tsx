import Link from "next/link";
import { db, freelancersTable } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import FreelancerListClient from "./_client";

export const dynamic = "force-dynamic";

export default async function FreelancersAdminPage() {
  const { userId } = await auth();
  const freelancers = await db
    .select()
    .from(freelancersTable)
    .where(eq(freelancersTable.createdBy, userId!))
    .orderBy(desc(freelancersTable.createdAt));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Freelancers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {freelancers.length} freelancer{freelancers.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/admin/freelancers/new">
          <Button size="sm">
            <Plus size={14} /> Add Freelancer
          </Button>
        </Link>
      </div>
      <FreelancerListClient freelancers={freelancers} />
    </div>
  );
}
