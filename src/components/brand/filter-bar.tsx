"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectDef = {
  name: string;
  allLabel: string;
  value: string;
  options: string[];
};
export type ToggleDef = { name: string; label: string; value: boolean };
export type SortDef = {
  name: string;
  value: string;
  options: { value: string; label: string }[];
};

const controlClass =
  "h-11 rounded-xl border border-border bg-canvas px-3 text-sm font-medium text-ink outline-none transition-colors hover:border-border-hover focus:border-teal-600 focus:bg-surface";

/**
 * Search + filters for list pages. Filters sit inline on desktop and collapse
 * into a bottom sheet on mobile (with an active-count badge). Changes apply
 * immediately (URL-driven); active filters render as removable chips.
 */
export function FilterBar({
  basePath,
  searchName = "q",
  searchValue,
  placeholder,
  selects = [],
  toggles = [],
  sort,
}: {
  basePath: string;
  searchName?: string;
  searchValue: string;
  placeholder: string;
  selects?: SelectDef[];
  toggles?: ToggleDef[];
  sort?: SortDef;
}) {
  const router = useRouter();
  const [q, setQ] = useState(searchValue);
  const [open, setOpen] = useState(false);

  const buildUrl = (overrides: Record<string, string | null>) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set(searchName, q.trim());
    for (const s of selects) if (s.value) params.set(s.name, s.value);
    for (const t of toggles) if (t.value) params.set(t.name, "1");
    if (sort?.value) params.set(sort.name, sort.value);
    for (const [k, v] of Object.entries(overrides)) {
      if (!v) params.delete(k);
      else params.set(k, v);
    }
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const go = (overrides: Record<string, string | null>) =>
    router.push(buildUrl(overrides));

  const clearAll = () => {
    setQ("");
    router.push(basePath);
    setOpen(false);
  };

  const activeCount =
    selects.filter((s) => s.value).length + toggles.filter((t) => t.value).length;
  const hasFilterControls = selects.length > 0 || toggles.length > 0 || !!sort;

  const renderControls = (inSheet: boolean) => (
    <>
      {selects.map((s) => (
        <select
          key={`${s.name}-${s.value}`}
          defaultValue={s.value}
          aria-label={s.allLabel}
          onChange={(e) => go({ [s.name]: e.target.value || null })}
          className={cn(controlClass, inSheet && "w-full")}
        >
          <option value="">{s.allLabel}</option>
          {s.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ))}

      {toggles.map((t) => (
        <label
          key={`${t.name}-${t.value}`}
          className={cn(
            "inline-flex h-11 cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl border border-border bg-canvas px-3.5 text-sm text-ink",
            inSheet && "w-full justify-between",
          )}
        >
          {t.label}
          <input
            type="checkbox"
            defaultChecked={t.value}
            onChange={(e) => go({ [t.name]: e.target.checked ? "1" : null })}
            className="h-4 w-4 rounded border-border accent-teal-600"
          />
        </label>
      ))}

      {sort && (
        <div
          className={cn(
            "inline-flex rounded-xl border border-border bg-canvas p-1",
            inSheet && "w-full",
          )}
        >
          {sort.options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => go({ [sort.name]: o.value })}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
                inSheet && "flex-1",
                sort.value === o.value
                  ? "bg-teal-600 text-white"
                  : "text-muted-foreground hover:text-ink",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="mt-7">
      <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-surface p-3 shadow-[var(--shadow-sm)]">
        <form
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            go({});
          }}
        >
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            dir="auto"
            placeholder={placeholder}
            className="h-11 w-full rounded-xl border border-transparent bg-canvas pl-10 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-600 focus:bg-surface"
          />
        </form>

        {hasFilterControls && (
          <div className="hidden items-center gap-2.5 lg:flex">
            {renderControls(false)}
          </div>
        )}

        {hasFilterControls && (
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
        )}
      </div>

      {(activeCount > 0 || !!q.trim()) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {q.trim() && (
            <Chip onClear={() => { setQ(""); go({ [searchName]: null }); }}>
              &ldquo;{q.trim()}&rdquo;
            </Chip>
          )}
          {selects
            .filter((s) => s.value)
            .map((s) => (
              <Chip key={s.name} onClear={() => go({ [s.name]: null })}>
                {s.value}
              </Chip>
            ))}
          {toggles
            .filter((t) => t.value)
            .map((t) => (
              <Chip key={t.name} onClear={() => go({ [t.name]: null })}>
                {t.label}
              </Chip>
            ))}
          <button
            type="button"
            onClick={clearAll}
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
            <div className="flex flex-col gap-3">{renderControls(true)}</div>
            <div className="mt-5 flex gap-2.5">
              <button type="button" onClick={clearAll} className="btn btn-ghost flex-1">
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

function Chip({
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
