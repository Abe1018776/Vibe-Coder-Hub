"use client";

import { useMemo, useState } from "react";
import { Briefcase } from "lucide-react";
import { EmptyState } from "@/components/brand/empty-state";
import {
  FilterShell,
  fieldClass,
  type ActiveChip,
} from "@/components/filters/filter-shell";
import type { Gig } from "@/lib/gigs";

/** The fields the board needs to filter on — kept plain so this client
 *  component never imports the server-only gigs lib. */
export type GigFilterItem = {
  id: string;
  title: string;
  description: string;
  type: Gig["type"];
  budget_min: number | null;
  budget_max: number | null;
  hourly_rate: number | null;
  tags: string[];
};

const TYPE_OPTIONS: { value: Gig["type"]; label: string }[] = [
  { value: "task", label: "Task" },
  { value: "build", label: "Build" },
  { value: "hourly", label: "Hourly" },
];

/** Preset budget bands (USD). A gig matches a band if its budget OR hourly
 *  rate overlaps the band — simpler + faster to scan than a dual slider. */
const BUDGET_BANDS: { value: string; label: string; min: number; max: number }[] =
  [
    { value: "0-250", label: "Under $250", min: 0, max: 250 },
    { value: "250-1000", label: "$250 – $1k", min: 250, max: 1000 },
    { value: "1000-5000", label: "$1k – $5k", min: 1000, max: 5000 },
    { value: "5000-inf", label: "$5k+", min: 5000, max: Infinity },
  ];

/** A single number that represents where a gig sits on the money axis, so a
 *  band can include it. Hourly gigs use their rate; fixed gigs use the mid of
 *  their range (or whichever bound is set). */
function gigMoneyPoints(g: GigFilterItem): number[] {
  if (g.type === "hourly" && g.hourly_rate != null) return [g.hourly_rate];
  const pts: number[] = [];
  if (g.budget_min != null) pts.push(g.budget_min);
  if (g.budget_max != null) pts.push(g.budget_max);
  return pts;
}

function matchesBand(g: GigFilterItem, bandValue: string): boolean {
  const band = BUDGET_BANDS.find((b) => b.value === bandValue);
  if (!band) return true;
  const pts = gigMoneyPoints(g);
  if (pts.length === 0) return false; // no stated budget can't match a band
  // Overlap: any point within the band, or the gig's [min,max] straddles it.
  const lo = Math.min(...pts);
  const hi = Math.max(...pts);
  return lo <= band.max && hi >= band.min;
}

export function GigsBoard({
  items,
  cards,
}: {
  items: GigFilterItem[];
  /** Server-rendered <GigCard> per id, so card rendering stays on the server
   *  while filtering runs here on the client. */
  cards: Record<string, React.ReactNode>;
}) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [band, setBand] = useState("");
  const [tag, setTag] = useState("");

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const g of items) for (const t of g.tags) set.add(t);
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((g) => {
      if (
        needle &&
        !(
          g.title.toLowerCase().includes(needle) ||
          g.description.toLowerCase().includes(needle) ||
          g.tags.some((t) => t.toLowerCase().includes(needle))
        )
      )
        return false;
      if (type && g.type !== type) return false;
      if (band && !matchesBand(g, band)) return false;
      if (tag && !g.tags.includes(tag)) return false;
      return true;
    });
  }, [items, q, type, band, tag]);

  const activeCount =
    (type ? 1 : 0) + (band ? 1 : 0) + (tag ? 1 : 0);

  const chips: ActiveChip[] = [];
  if (q.trim())
    chips.push({ key: "q", label: `“${q.trim()}”`, onClear: () => setQ("") });
  if (type)
    chips.push({
      key: "type",
      label: TYPE_OPTIONS.find((t) => t.value === type)?.label ?? type,
      onClear: () => setType(""),
    });
  if (band)
    chips.push({
      key: "band",
      label: BUDGET_BANDS.find((b) => b.value === band)?.label ?? band,
      onClear: () => setBand(""),
    });
  if (tag) chips.push({ key: "tag", label: tag, onClear: () => setTag("") });

  const clearAll = () => {
    setQ("");
    setType("");
    setBand("");
    setTag("");
  };

  const controls = (stacked: boolean) => (
    <>
      <select
        aria-label="Filter by type"
        value={type}
        onChange={(e) => setType(e.target.value)}
        className={stacked ? fieldClass : `${fieldClass} lg:w-auto`}
      >
        <option value="">All types</option>
        {TYPE_OPTIONS.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by budget"
        value={band}
        onChange={(e) => setBand(e.target.value)}
        className={stacked ? fieldClass : `${fieldClass} lg:w-auto`}
      >
        <option value="">Any budget</option>
        {BUDGET_BANDS.map((b) => (
          <option key={b.value} value={b.value}>
            {b.label}
          </option>
        ))}
      </select>

      {allTags.length > 0 && (
        <select
          aria-label="Filter by tag"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className={stacked ? fieldClass : `${fieldClass} lg:w-auto`}
        >
          <option value="">All tags</option>
          {allTags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      )}
    </>
  );

  return (
    <>
      <FilterShell
        searchValue={q}
        onSearchChange={setQ}
        placeholder="Search gigs by title, description, tag…"
        controls={controls}
        activeCount={activeCount}
        chips={chips}
        onClearAll={clearAll}
      />

      {filtered.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<Briefcase size={22} />}
          title="No gigs match"
          description="Try a broader keyword or clear a filter to see more gigs."
        />
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((g) => (
            <div key={g.id}>{cards[g.id]}</div>
          ))}
        </div>
      )}
    </>
  );
}
