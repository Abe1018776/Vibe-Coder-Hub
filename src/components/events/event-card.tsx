import { Clock, MapPin, ArrowUpRight } from "lucide-react";
import type { EventRow } from "@/lib/events";
import { formatTime } from "./calendar-utils";

/**
 * One event row, shared by the calendar day-panel and the agenda list. Time and
 * location are optional and collapse cleanly when an event has neither.
 */
export function EventCard({ event }: { event: EventRow }) {
  const time = formatTime(event.starts_at);
  return (
    <li className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-4 transition-all hover:border-border-hover hover:shadow-[var(--shadow-sm)]">
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-lg font-bold text-ink" dir="auto">
          {event.title}
        </h3>
        {(time || event.location) && (
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {time && (
              <span className="inline-flex items-center gap-1">
                <Clock size={13} /> {time}
              </span>
            )}
            {event.location && (
              <span className="inline-flex items-center gap-1" dir="auto">
                <MapPin size={13} /> {event.location}
              </span>
            )}
          </p>
        )}
        {event.description && (
          <p
            className="mt-2 line-clamp-2 text-sm text-muted-foreground"
            dir="auto"
          >
            {event.description}
          </p>
        )}
      </div>
      {event.url && (
        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-sm shrink-0"
        >
          RSVP <ArrowUpRight size={14} />
        </a>
      )}
    </li>
  );
}
