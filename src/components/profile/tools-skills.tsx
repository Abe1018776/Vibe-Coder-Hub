"use client";

import { useState } from "react";
import { ToolPill, TagPill } from "@/components/brand/pill";

function Row({
  label,
  items,
  kind,
  hrefFor,
}: {
  label: string;
  items: string[];
  kind: "tool" | "skill";
  hrefFor: (v: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return null;

  const shown = expanded ? items : items.slice(0, 3);
  const extra = items.length - shown.length;
  const Pill = kind === "tool" ? ToolPill : TagPill;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 w-12 shrink-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      {shown.map((v) => (
        <Pill key={v} href={hrefFor(v)}>
          {v}
        </Pill>
      ))}
      {extra > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-ink"
        >
          +{extra} more
        </button>
      )}
    </div>
  );
}

/** Two rows — Tools and Skills — each showing the first 3, with an inline
 *  "+N more" expander. Pills link to the Directory filtered by that value. */
export function ToolsSkills({
  tools,
  skills,
}: {
  tools: string[];
  skills: string[];
}) {
  if (tools.length === 0 && skills.length === 0) return null;
  return (
    <div className="mt-5 flex flex-col gap-2.5">
      <Row
        label="Tools"
        items={tools}
        kind="tool"
        hrefFor={(v) => `/directory?tool=${encodeURIComponent(v)}`}
      />
      <Row
        label="Skills"
        items={skills}
        kind="skill"
        hrefFor={(v) => `/directory?skill=${encodeURIComponent(v)}`}
      />
    </div>
  );
}
