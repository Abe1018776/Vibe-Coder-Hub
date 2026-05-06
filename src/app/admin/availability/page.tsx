import { db, availabilitySlotsTable, freelancersTable } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import AvailabilityClient from "./_client";

export const dynamic = "force-dynamic";

export default async function AvailabilityPage() {
  const [slots, freelancers] = await Promise.all([
    db
      .select({
        slot: availabilitySlotsTable,
        freelancerName: freelancersTable.name,
      })
      .from(availabilitySlotsTable)
      .leftJoin(
        freelancersTable,
        eq(freelancersTable.id, availabilitySlotsTable.freelancerId),
      )
      .orderBy(asc(availabilitySlotsTable.date)),
    db
      .select({ id: freelancersTable.id, name: freelancersTable.name })
      .from(freelancersTable)
      .orderBy(asc(freelancersTable.name)),
  ]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-1">Availability</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Slots freelancers have offered.
      </p>
      <AvailabilityClient
        initialSlots={slots.map((s) => ({
          ...s.slot,
          freelancerName: s.freelancerName,
        }))}
        freelancers={freelancers}
      />
    </div>
  );
}
