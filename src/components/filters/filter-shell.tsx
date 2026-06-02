"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

/**
 * Presentational shell shared by the tailored Gigs + Competitions board filters
 * (and, via the exported `SearchField`/`Chip`, the Events board) so all three
 * boards read as one family: a rounded surface bar with a prominent lucide
 * search field, inline controls on desktop, a bottom-sheet on mobile (with an
 * active-count badge), a live result count, and removable chips.
 *
 * This shell holds NO filter logic — each board owns its own state/predicates
 * and feeds controls + chips in. Client-side only; no URL writes.
 */

export const fieldClass =
  "h-11 w-full rounded-xl border border-border bg-canvas px-3 text-sm font-medium text-ink outline-none transition-colors hover:border-border-hover focus:border-teal-600 focus:bg-surface";

/**
 * Shared search-input treatment used by every board's keyword box so the three
 * experiences read as one family: a prominent bordered field, lucide search
 * glyph on the left, generous height, and a teal focus ring.
 */
export const searchInputClass =
  "h-12 w-full rounded-xl border border-border bg-canvas pl-11 pr-10 text-[15px] text-ink outline-none transition-colors placeholder:text-muted-foreground hover:border-border-hover focus:border-teal-600 focus:bg-surface focus:ring-2 focus:ring-teal-600/15";

export type ActiveChip = { key: string; label: string; onClear: () => void };

/**
 * The prominent keyword field shared by all three boards. Renders the lucide
 * search glyph, an `aria-label`, RTL-aware input, and a clear (×) button when
 * there's text — so search always looks present and obviously interactive.
 */
export function SearchField({
  value,
  onChange,
  placeholder,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  ariaLabel: string;
}) {
  return (
    <div className="relative flex-1">
      <Search
        size={18}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-700"
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir="auto"
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={searchInputClass}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-ink"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}

export function FilterShell({
  searchValue,
  onSearchChange,
  placeholder,
  searchAriaLabel,
  controls,
  activeCount,
  chips,
  onClearAll,
  resultLabel,
}: {
  searchValue: string;
  onSearchChange: (v: string) => void;
  placeholder: string;
  searchAriaLabel: string;
  /** The select/range/toggle controls. Rendered inline on desktop and stacked
   *  in the mobile sheet. `stacked` lets a control go full-width in the sheet. */
  controls: (stacked: boolean) => React.ReactNode;
  activeCount: number;
  chips: ActiveChip[];
  onClearAll: () => void;
  /** Live "Showing N gigs" feedback so search/filter clearly works. */
  resultLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-7">
      <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-surface p-3 shadow-[var(--shadow-sm)]">
        <SearchField
          value={searchValue}
          onChange={onSearchChange}
          placeholder={placeholder}
          ariaLabel={searchAriaLabel}
        />

        <div className="hidden flex-wrap items-center gap-2.5 lg:flex">
          {controls(false)}
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl border border-border bg-canvas px-3.5 text-sm font-medium text-ink hover:border-border-hover lg:hidden"
        >
          <SlidersHorizontal size={15} /> Filters
          {activeCount > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-teal-600 px-1 text-[11px] font-semibold text-white">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-medium text-muted-foreground">
          {resultLabel}
        </span>
        {chips.map((c) => (
          <Chip key={c.key} onClear={c.onClear}>
            {c.label}
          </Chip>
        ))}
        {chips.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-sm font-medium text-teal-800 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

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
