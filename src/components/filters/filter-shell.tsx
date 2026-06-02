"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

/**
 * Presentational shell shared by the tailored Gigs + Competitions board filters
 * so the two bars read as one family with the URL-driven `brand/filter-bar`:
 * a rounded surface bar with a lucide search field, inline controls on desktop,
 * a bottom-sheet on mobile (with an active-count badge), and removable chips.
 *
 * This shell holds NO filter logic — each board owns its own state/predicates
 * and feeds controls + chips in. Client-side only; no URL writes.
 */

export const fieldClass =
  "h-11 w-full rounded-xl border border-border bg-canvas px-3 text-sm font-medium text-ink outline-none transition-colors hover:border-border-hover focus:border-teal-600 focus:bg-surface";

export type ActiveChip = { key: string; label: string; onClear: () => void };

export function FilterShell({
  searchValue,
  onSearchChange,
  placeholder,
  controls,
  activeCount,
  chips,
  onClearAll,
}: {
  searchValue: string;
  onSearchChange: (v: string) => void;
  placeholder: string;
  /** The select/range/toggle controls. Rendered inline on desktop and stacked
   *  in the mobile sheet. `stacked` lets a control go full-width in the sheet. */
  controls: (stacked: boolean) => React.ReactNode;
  activeCount: number;
  chips: ActiveChip[];
  onClearAll: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-7">
      <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-surface p-3 shadow-[var(--shadow-sm)]">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            dir="auto"
            placeholder={placeholder}
            className="h-11 w-full rounded-xl border border-transparent bg-canvas pl-10 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-600 focus:bg-surface"
          />
        </div>

        <div className="hidden flex-wrap items-center gap-2.5 lg:flex">
          {controls(false)}
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-border bg-canvas px-3.5 text-sm font-medium text-ink hover:border-border-hover lg:hidden"
        >
          <SlidersHorizontal size={15} /> Filters
          {activeCount > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-teal-600 px-1 text-[11px] font-semibold text-white">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {chips.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {chips.map((c) => (
            <Chip key={c.key} onClear={c.onClear}>
              {c.label}
            </Chip>
          ))}
          <button
            type="button"
            onClick={onClearAll}
            className="text-sm font-medium text-teal-800 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            aria-label="Close filters"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/30"
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-border bg-surface p-5 pb-8 shadow-float">
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-lg font-semibold text-ink">
                Filters
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="icon-btn"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-3">{controls(true)}</div>
            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onClearAll();
                  setOpen(false);
                }}
                className="btn btn-ghost flex-1"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn btn-primary flex-1"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Removable active-filter chip — mirrors `brand/filter-bar`. */
export function Chip({
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
