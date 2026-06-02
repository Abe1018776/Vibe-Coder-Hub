import type { EventRow } from "@/lib/events";

/** A stable yyyy-mm-dd key for a Date in the viewer's local timezone. */
export function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Local-day key for an event's `starts_at`, or null when the event is undated. */
export function eventDayKey(e: Pick<EventRow, "starts_at">): string | null {
  if (!e.starts_at) return null;
  const d = new Date(e.starts_at);
  if (Number.isNaN(d.getTime())) return null;
  return dayKey(d);
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

/**
 * The 6-week (42-cell) grid that frames a month: leading days spill in from the
 * previous month and trailing days from the next so every week is full. Weeks
 * start on Sunday to match the community's calendar habit.
 */
export function monthGrid(month: Date): Date[] {
  const first = startOfMonth(month);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay()); // back up to Sunday
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function formatMonthYear(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function formatDayHeading(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Time-of-day label, e.g. "7:30 PM". Empty when the event carries no time. */
export function formatTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

/** Map of dayKey -> events on that day, plus the undated bucket, all date-sorted. */
export function groupByDay(events: EventRow[]): {
  byDay: Map<string, EventRow[]>;
  undated: EventRow[];
} {
  const byDay = new Map<string, EventRow[]>();
  const undated: EventRow[] = [];
  for (const e of events) {
    const key = eventDayKey(e);
    if (!key) {
      undated.push(e);
      continue;
    }
    const list = byDay.get(key);
    if (list) list.push(e);
    else byDay.set(key, [e]);
  }
  return { byDay, undated };
}
