import { useParams, Link } from "wouter";
import {
  useGetFreelancer,
  useListAvailabilitySlots,
  useUpdateFreelancer,
  getGetFreelancerQueryKey,
  getListAvailabilitySlotsQueryKey,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function FreelancerProfile() {
  const { id } = useParams<{ id: string }>();
  const freelancerId = Number(id);

  const { data: freelancer, isLoading } = useGetFreelancer(freelancerId, {
    query: { enabled: !!freelancerId, queryKey: getGetFreelancerQueryKey(freelancerId) },
  });

  const { data: slots } = useListAvailabilitySlots(
    { freelancerId },
    { query: { enabled: !!freelancerId, queryKey: getListAvailabilitySlotsQueryKey({ freelancerId }) } }
  );

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-48 rounded-md" />
      </div>
    );
  }

  if (!freelancer) {
    return <div className="p-6 text-sm text-muted-foreground">Freelancer not found.</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-4">
        <Link href="/freelancers">
          <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">&larr; Back to Freelancers</span>
        </Link>
      </div>

      {/* Profile */}
      <div className="border border-border rounded-md bg-card p-5 mb-5">
        <div className="flex items-start gap-4">
          {freelancer.avatarPath ? (
            <img
              src={`/api/storage/objects/${freelancer.avatarPath.replace(/^\//, "")}`}
              className="w-16 h-16 rounded-full object-cover shrink-0"
              alt={freelancer.name}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
              {freelancer.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-foreground" data-testid="freelancer-name">{freelancer.name}</h1>
            {freelancer.hourlyRate && (
              <div className="text-sm text-primary font-medium">${freelancer.hourlyRate}/hr</div>
            )}
            {freelancer.bio && (
              <p className="text-sm text-muted-foreground mt-2">{freelancer.bio}</p>
            )}
          </div>
        </div>

        {/* Tools */}
        {freelancer.tools.length > 0 && (
          <div className="mt-4">
            <div className="text-xs font-medium text-muted-foreground mb-1.5">AI Tools</div>
            <div className="flex flex-wrap gap-1">
              {freelancer.tools.map((t) => (
                <span key={t} className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {freelancer.skills.length > 0 && (
          <div className="mt-3">
            <div className="text-xs font-medium text-muted-foreground mb-1.5">Skills</div>
            <div className="flex flex-wrap gap-1">
              {freelancer.skills.map((s) => (
                <span key={s} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio */}
        {freelancer.portfolioLinks.length > 0 && (
          <div className="mt-3">
            <div className="text-xs font-medium text-muted-foreground mb-1.5">Portfolio</div>
            <div className="flex flex-col gap-1">
              {freelancer.portfolioLinks.map((link) => (
                <a key={link} href={link} target="_blank" rel="noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline">
                  <ExternalLink size={11} /> {link}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        {freelancer.contactInfo && (
          <div className="mt-3">
            <div className="text-xs font-medium text-muted-foreground mb-1">Contact</div>
            <div className="text-sm text-foreground" data-testid="freelancer-contact">{freelancer.contactInfo}</div>
          </div>
        )}

        {/* Notes */}
        {freelancer.notes && (
          <div className="mt-3 border-t border-border pt-3">
            <div className="text-xs font-medium text-muted-foreground mb-1">Internal notes</div>
            <p className="text-xs text-muted-foreground">{freelancer.notes}</p>
          </div>
        )}
      </div>

      {/* Availability slots */}
      <div className="border border-border rounded-md bg-card">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Calendar size={14} className="text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Availability slots</span>
        </div>
        {slots && slots.length > 0 ? (
          <ul className="divide-y divide-border">
            {slots.map((slot) => (
              <li key={slot.id} className="px-4 py-3" data-testid={`slot-item-${slot.id}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">{slot.date} · {slot.startTime}–{slot.endTime}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 capitalize">{slot.workType.replace("_", " ")} · {slot.durationHours}h{slot.hourlyRate ? ` · $${slot.hourlyRate}/hr` : ""}</div>
                    {slot.notes && <div className="text-xs text-muted-foreground mt-0.5">{slot.notes}</div>}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${slot.isBooked ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-800"}`}>
                    {slot.isBooked ? "Booked" : "Available"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-6 text-center text-sm text-muted-foreground">No availability slots posted.</div>
        )}
      </div>
    </div>
  );
}
