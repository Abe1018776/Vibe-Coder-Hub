"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  WEEKDAY_LABELS,
  addMonths,
  dayKey,
  formatMonthYear,
  monthGrid,
  sameDay,
} from "./calendar-utils";

/**
 * Lightweight month grid (no deps). Days that hold matching events get a count
 * marker; clicking a day selects it. Built around a 6-week grid so the frame
 * never reflows between months.
 */
export function EventCalendar({
  month,
  onMonthChange,
  selected,
  onSelect,
  counts,
  today,
}: {
  month: Date;
  onMonthChange: (next: Date) => void;
  selected: Date | null;
  onSelect: (day: Date) => void;
  /** dayKey -> number of (filtered) events that day. */
  counts: Map<string, number>;
  today: Date;
}) {
  const cells = monthGrid(month);
  const monthIndex = month.getMonth();

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-sm)] sm:p-5">
      {/* Month header + nav */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-ink">
          {formatMonthYear(month)}
        </h2>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(month, -1))}
            className="icon-btn"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(new Date(today.getFullYear(), today.getMonth(), 1))}
            className="rounded-full border border-border bg-canvas px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-border-hover hover:text-ink"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(month, 1))}
            className="icon-btn"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Weekday header */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((w) => (
          <div
            key={w}
            className="py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
          >
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d) => {
          const key = dayKey(d);
          const count = counts.get(key) ?? 0;
          const inMonth = d.getMonth() === monthIndex;
          const isToday = sameDay(d, today);
          const isSelected = selected != null && sameDay(d, selected);
          const hasEvents = count > 0;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(d)}
              aria-pressed={isSelected}
              aria-label={`${d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}${
                hasEvents ? `, ${count} event${count > 1 ? "s" : ""}` : ""
              }`}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-colors",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-600",
                !inMonth && "text-muted-foreground/40",
                inMonth && !isSelected && "text-ink hover:bg-teal-50",
                isSelected && "bg-teal-600 text-white",
                !isSelected && isToday && "ring-1 ring-inset ring-teal-600",
                !isSelected && hasEvents && inMonth && "font-semibold",
              )}
            >
              <span>{d.getDate()}</span>
              {hasEvents && (
                <span
                  className={cn(
                    "mt-0.5 inline-flex h-1.5 w-1.5 rounded-full",
                    isSelected ? "bg-white" : "bg-teal-600",
                  )}
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
