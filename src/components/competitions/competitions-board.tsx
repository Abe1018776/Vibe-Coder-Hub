"use client";

import { useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import { EmptyState } from "@/components/brand/empty-state";
import {
  FilterShell,
  fieldClass,
  type ActiveChip,
} from "@/components/filters/filter-shell";

/** Plain shape the board filters on — keeps this client component free of the
 *  server-only competitions lib. */
export type CompetitionFilterItem = {
  id: string;
  title: string;
  description: string;
  prize_amount: number;
  deadline: string;
  hasWinner: boolean;
  tags: string[];
};

const WEEK_MS = 7 * 86_400_000;

/** Practical "where is this competition" facet — blends deadline + winner
 *  state, which is what people actually filter on. */
const STATUS_OPTIONS: {
  value: string;
  label: string;
  match: (c: CompetitionFilterItem, now: number) => boolean;
}[] = [
  {
    value: "open",
    label: "Open",
    match: (c, now) => !c.hasWinner && new Date(c.deadline).getTime() > now,
  },
  {
    value: "ending",
    label: "Ending soon",
    match: (c, now) => {
      const diff = new Date(c.deadline).getTime() - now;
      return !c.hasWinner && diff > 0 && diff <= WEEK_MS;
    },
  },
  {
    value: "ended",
    label: "Ended",
    match: (c, now) => !c.hasWinner && new Date(c.deadline).getTime() <= now,
  },
  {
    value: "winner",
    label: "Winner picked",
    match: (c) => c.hasWinner,
  },
];

/** Preset prize bands (USD). A competition matches if its prize sits in the band. */
const PRIZE_BANDS: { value: string; label: string; min: number; max: number }[] =
  [
    { value: "0-250", label: "Under $250", min: 0, max: 250 },
    { value: "250-1000", label: "$250 – $1k", min: 250, max: 1000 },
    { value: "1000-5000", label: "$1k – $5k", min: 1000, max: 5000 },
    { value: "5000-inf", label: "$5k+", min: 5000, max: Infinity },
  ];

export function CompetitionsBoard({
  items,
  cards,
}: {
  items: CompetitionFilterItem[];
  /** Server-rendered <CompetitionCard> per id. */
  cards: Record<string, React.ReactNode>;
}) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [band, setBand] = useState("");
  const [tag, setTag] = useState("");

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const c of items) for (const t of c.tags) set.add(t);
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const now = Date.now();
    const statusDef = STATUS_OPTIONS.find((s) => s.value === status);
    const bandDef = PRIZE_BANDS.find((b) => b.value === band);
    return items.filter((c) => {
      if (
        needle &&
        !(
          c.title.toLowerCase().includes(needle) ||
          c.description.toLowerCase().includes(needle) ||
          c.tags.some((t) => t.toLowerCase().includes(needle))
        )
      )
        return false;
      if (statusDef && !statusDef.match(c, now)) return false;
      if (bandDef && !(c.prize_amount >= bandDef.min && c.prize_amount <= bandDef.max))
        return false;
      if (tag && !c.tags.includes(tag)) return false;
      return true;
    });
  }, [items, q, status, band, tag]);

  const activeCount = (status ? 1 : 0) + (band ? 1 : 0) + (tag ? 1 : 0);

  const chips: ActiveChip[] = [];
  if (q.trim())
    chips.push({ key: "q", label: `“${q.trim()}”`, onClear: () => setQ("") });
  if (status)
    chips.push({
      key: "status",
      label: STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status,
      onClear: () => setStatus(""),
    });
  if (band)
    chips.push({
      key: "band",
      label: PRIZE_BANDS.find((b) => b.value === band)?.label ?? band,
      onClear: () => setBand(""),
    });
  if (tag) chips.push({ key: "tag", label: tag, onClear: () => setTag("") });

  const clearAll = () => {
    setQ("");
    setStatus("");
    setBand("");
    setTag("");
  };

  const controls = (stacked: boolean) => (
    <>
      <select
        aria-label="Filter by status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className={stacked ? fieldClass : `${fieldClass} lg:w-auto`}
      >
        <option value="">Any status</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by prize"
        value={band}
        onChange={(e) => setBand(e.target.value)}
        className={stacked ? fieldClass : `${fieldClass} lg:w-auto`}
      >
        <option value="">Any prize</option>
        {PRIZE_BANDS.map((b) => (
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

  const total = items.length;
  const shown = filtered.length;
  const resultLabel =
    shown === total
      ? `${total} ${total === 1 ? "competition" : "competitions"}`
      : `${shown} of ${total} competitions`;

  return (
    <>
      <FilterShell
        searchValue={q}
        onSearchChange={setQ}
        placeholder="Search competitions by title, description, tag…"
        searchAriaLabel="Search competitions"
        controls={controls}
        activeCount={activeCount}
        chips={chips}
        onClearAll={clearAll}
        resultLabel={resultLabel}
      />

      {filtered.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<Trophy size={22} />}
          title="No competitions match"
          description="Try a broader keyword or clear a filter to see more competitions."
        />
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div key={c.id}>{cards[c.id]}</div>
          ))}
        </div>
      )}
    </>
  );
}
