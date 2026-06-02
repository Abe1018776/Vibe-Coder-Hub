"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  LayoutList,
  Search,
  MapPin,
  X,
  CalendarClock,
} from "lucide-react";
import type { EventRow } from "@/lib/events";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/brand/empty-state";
import { EventCalendar } from "./event-calendar";
import { EventCard } from "./event-card";
import {
  dayKey,
  formatDayHeading,
  groupByDay,
  startOfMonth,
} from "./calendar-utils";

type View = "calendar" | "agenda";

/**
 * The interactive Events board. All browsing — month calendar, agenda list,
 * keyword search and location filter — runs client-side over the events handed
 * in by the server, so it stays fast and there are no extra round-trips.
 */
export function EventsBoard({ events }: { events: EventRow[] }) {
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState<View>("calendar");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [month, setMonth] = useState<Date>(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState<Date | null>(null);

  // Distinct locations for the dropdown (case-insensitive, keeps first casing).
  const locations = useMemo(() => {
    const seen = new Map<string, string>();
    for (const e of events) {
      const loc = e.location?.trim();
      if (loc && !seen.has(loc.toLowerCase())) seen.set(loc.toLowerCase(), loc);
    }
    return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
  }, [events]);

  // Apply keyword + location filters once; everything downstream reads this.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const loc = location.trim().toLowerCase();
    return events.filter((e) => {
      if (loc && e.location?.trim().toLowerCase() !== loc) return false;
      if (q) {
        const haystack = `${e.title} ${e.description ?? ""} ${e.location ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [events, query, location]);

  const { byDay, undated } = useMemo(() => groupByDay(filtered), [filtered]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const [k, list] of byDay) m.set(k, list.length);
    return m;
  }, [byDay]);

  const selectedEvents = selected ? (byDay.get(dayKey(selected)) ?? []) : [];

  // Dated events from today onward, grouped for the agenda view.
  const agendaGroups = useMemo(() => {
    const todayKey = dayKey(today);
    const groups: { key: string; date: Date; events: EventRow[] }[] = [];
    for (const [key, list] of byDay) {
      if (key < todayKey) continue; // agenda looks forward
      groups.push({ key, date: new Date(`${key}T00:00:00`), events: list });
    }
    groups.sort((a, b) => a.key.localeCompare(b.key));
    return groups;
  }, [byDay, today]);

  const hasFilters = query.trim() !== "" || location !== "";
  const clearFilters = () => {
    setQuery("");
    setLocation("");
  };

  return (
    <div className="mt-8">
      {/* Controls: search + location + view toggle */}
      <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-surface p-3 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            dir="auto"
            placeholder="Search events"
            aria-label="Search events"
            className="h-11 w-full rounded-xl border border-transparent bg-canvas pl-10 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-600 focus:bg-surface"
          />
        </div>

        {locations.length > 0 && (
          <div className="relative sm:w-52">
            <MapPin
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              aria-label="Filter by location"
              className="h-11 w-full appearance-none rounded-xl border border-border bg-canvas pl-10 pr-3 text-sm font-medium text-ink outline-none transition-colors hover:border-border-hover focus:border-teal-600 focus:bg-surface"
            >
              <option value="">All locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="inline-flex rounded-xl border border-border bg-canvas p-1">
          <ViewButton
            active={view === "calendar"}
            onClick={() => setView("calendar")}
            icon={<CalendarDays size={15} />}
            label="Calendar"
          />
          <ViewButton
            active={view === "agenda"}
            onClick={() => setView("agenda")}
            icon={<LayoutList size={15} />}
            label="Agenda"
          />
        </div>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {query.trim() && (
            <FilterChip onClear={() => setQuery("")}>
              &ldquo;{query.trim()}&rdquo;
            </FilterChip>
          )}
          {location && (
            <FilterChip onClear={() => setLocation("")}>{location}</FilterChip>
          )}
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-medium text-teal-800 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* ── Calendar view ─────────────────────────────────────────────── */}
      {view === "calendar" && (
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <EventCalendar
            month={month}
            onMonthChange={setMonth}
            selected={selected}
            onSelect={setSelected}
            counts={counts}
            today={today}
          />

          <div>
            {selected ? (
              <div className="rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-sm)] sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="font-display text-base font-bold text-ink">
                    {formatDayHeading(selected)}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="icon-btn"
                    aria-label="Clear selected day"
                  >
                    <X size={16} />
                  </button>
                </div>
                {selectedEvents.length > 0 ? (
                  <ul className="space-y-3">
                    {selectedEvents.map((e) => (
                      <EventCard key={e.id} event={e} />
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-xl border border-dashed border-border bg-canvas px-4 py-8 text-center text-sm text-muted-foreground">
                    No events on this day.
                  </p>
                )}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                  <CalendarDays size={22} />
                </div>
                <p className="font-display text-base font-bold text-ink">
                  Pick a day
                </p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Select a date with a marker to see what&rsquo;s happening.
                </p>
              </div>
            )}

            {/* Undated / upcoming list — events without a set date. */}
            {undated.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  <CalendarClock size={13} /> Date to be announced
                </p>
                <ul className="space-y-3">
                  {undated.map((e) => (
                    <EventCard key={e.id} event={e} />
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Agenda view ───────────────────────────────────────────────── */}
      {view === "agenda" && (
        <div className="mt-5">
          {agendaGroups.length === 0 && undated.length === 0 ? (
            <EmptyState
              icon={<CalendarDays size={22} />}
              title={hasFilters ? "No events match" : "No upcoming events"}
              description={
                hasFilters
                  ? "Try a different search or clear your filters."
                  : "Hosting a workshop or meetup? Add it so the community can join."
              }
              {...(hasFilters
                ? {}
                : {
                    actionHref: "/events/request",
                    actionLabel: "Request an event",
                  })}
            />
          ) : (
            <div className="space-y-7">
              {agendaGroups.map((g) => (
                <section key={g.key}>
                  <h3 className="mb-2.5 font-display text-sm font-bold text-ink">
                    {formatDayHeading(g.date)}
                  </h3>
                  <ul className="space-y-3">
                    {g.events.map((e) => (
                      <EventCard key={e.id} event={e} />
                    ))}
                  </ul>
                </section>
              ))}

              {undated.length > 0 && (
                <section>
                  <h3 className="mb-2.5 inline-flex items-center gap-1.5 font-display text-sm font-bold text-ink">
                    <CalendarClock size={14} /> Date to be announced
                  </h3>
                  <ul className="space-y-3">
                    {undated.map((e) => (
                      <EventCard key={e.id} event={e} />
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </div>
      )}

      {/* When filters hide everything in calendar view, say so. */}
      {view === "calendar" && hasFilters && filtered.length === 0 && (
        <p className="mt-5 rounded-2xl border border-dashed border-border bg-surface/60 px-4 py-6 text-center text-sm text-muted-foreground">
          No events match your filters.{" "}
          <button
            type="button"
            onClick={clearFilters}
            className="font-medium text-teal-800 hover:underline"
          >
            Clear all
          </button>
        </p>
      )}
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-teal-600 text-white"
          : "text-muted-foreground hover:text-ink",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function FilterChip({
  children,
  onClear,
}: {
  children: React.ReactNode;
  onClear: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-sm text-teal-800">
      {children}
      <button
        type="button"
        onClick={onClear}
        aria-label="Remove filter"
        className="-mr-0.5 rounded-full text-teal-700 hover:text-teal-900"
      >
        <X size={13} />
      </button>
    </span>
  );
}
