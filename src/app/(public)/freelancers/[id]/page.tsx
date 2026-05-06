import { notFound } from "next/navigation";
import { db, freelancersTable, availabilitySlotsTable } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function FreelancerProfilePage({ params }: Props) {
  const { id } = await params;
  const freelancerId = Number(id);
  if (!freelancerId) notFound();

  const [freelancer] = await db
    .select()
    .from(freelancersTable)
    .where(eq(freelancersTable.id, freelancerId))
    .limit(1);

  if (!freelancer) notFound();

  const slots = await db
    .select()
    .from(availabilitySlotsTable)
    .where(eq(availabilitySlotsTable.freelancerId, freelancerId))
    .orderBy(asc(availabilitySlotsTable.date));

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-start gap-5 mb-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl shrink-0">
          {freelancer.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold">{freelancer.name}</h1>
          {freelancer.hourlyRate && (
            <div className="text-sm text-muted-foreground">${freelancer.hourlyRate}/hr</div>
          )}
          {freelancer.bio && (
            <p className="text-sm text-foreground/90 mt-2">{freelancer.bio}</p>
          )}
        </div>
      </div>

      {freelancer.tools.length > 0 && (
        <Section title="Tools">
          <div className="flex flex-wrap gap-1.5">
            {freelancer.tools.map((t) => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            ))}
          </div>
        </Section>
      )}

      {freelancer.skills.length > 0 && (
        <Section title="Skills">
          <div className="flex flex-wrap gap-1.5">
            {freelancer.skills.map((s) => (
              <Badge key={s} variant="outline">
                {s}
              </Badge>
            ))}
          </div>
        </Section>
      )}

      {freelancer.portfolioLinks.length > 0 && (
        <Section title="Portfolio">
          <ul className="space-y-1.5">
            {freelancer.portfolioLinks.map((url) => (
              <li key={url}>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  {url}
                  <ExternalLink size={12} />
                </a>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {slots.length > 0 && (
        <Section title="Availability">
          <div className="grid gap-2">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="border border-border rounded-md p-3 text-sm flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">
                    {new Date(slot.date).toLocaleDateString()} · {slot.startTime}–{slot.endTime}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {slot.workType} · {slot.durationHours}h
                    {slot.hourlyRate ? ` · $${slot.hourlyRate}/hr` : ""}
                  </div>
                </div>
                {slot.isBooked ? (
                  <Badge variant="secondary">Booked</Badge>
                ) : (
                  <Badge>Open</Badge>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}
