import Link from "next/link";
import { Plus, CalendarDays, MapPin, ArrowUpRight } from "lucide-react";
import { listUpcomingEvents } from "@/lib/events";
import { EmptyState } from "@/components/brand/empty-state";

export const metadata = {
  title: "Events",
  description: "Community workshops and meetups for builders.",
};

function DateBlock({ iso }: { iso: string | null }) {
  if (!iso) return null;
  const d = new Date(iso);
  return (
    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-chip bg-sage-tint text-sage-deep">
      <span className="text-[11px] font-medium uppercase">
        {d.toLocaleDateString(undefined, { month: "short" })}
      </span>
      <span className="font-display text-xl leading-none">{d.getDate()}</span>
    </div>
  );
}

export default async function EventsPage() {
  const events = await listUpcomingEvents();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Events</h1>
          <p className="mt-2 text-muted-foreground">
            Community workshops and meetups for builders.
          </p>
        </div>
        <Link
          href="/events/post"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[10px] bg-sage-mid px-4 text-sm font-medium text-white transition-transform active:scale-[0.98]"
        >
          <Plus size={16} /> Add event
        </Link>
      </div>

      {events.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<CalendarDays size={22} />}
          title="No upcoming events"
          description="Hosting a workshop or meetup? Add it so the community can join."
          actionHref="/events/post"
          actionLabel="Add an event"
        />
      ) : (
        <ul className="mt-8 space-y-3">
          {events.map((e) => (
            <li
              key={e.id}
              className="flex items-start gap-4 rounded-card border border-border bg-surface p-4"
            >
              <DateBlock iso={e.starts_at} />
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-ink" dir="auto">
                  {e.title}
                </h3>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {e.starts_at &&
                    new Date(e.starts_at).toLocaleString(undefined, {
                      weekday: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  {e.location ? (
                    <span className="inline-flex items-center gap-1">
                      {" · "}
                      <MapPin size={13} /> {e.location}
                    </span>
                  ) : null}
                </p>
                {e.description && (
                  <p
                    className="mt-2 line-clamp-2 text-sm text-muted-foreground"
                    dir="auto"
                  >
                    {e.description}
                  </p>
                )}
              </div>
              {e.url && (
                <a
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 shrink-0 items-center gap-1 rounded-[10px] border border-border bg-surface px-3 text-sm font-medium text-ink transition-colors hover:bg-secondary"
                >
                  RSVP <ArrowUpRight size={14} />
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
