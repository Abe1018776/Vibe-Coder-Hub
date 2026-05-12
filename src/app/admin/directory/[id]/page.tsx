import { notFound } from "next/navigation";
import { db, professionalsTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import ProfessionalForm from "../_form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProfessionalPage({ params }: Props) {
  const { id } = await params;
  const pid = Number(id);
  if (!pid) notFound();

  const [row] = await db
    .select()
    .from(professionalsTable)
    .where(eq(professionalsTable.id, pid))
    .limit(1);
  if (!row) notFound();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-1">Edit Professional</h1>
      <p className="text-sm text-muted-foreground mb-6">{row.name}</p>
      <ProfessionalForm initial={row} />
    </div>
  );
}
