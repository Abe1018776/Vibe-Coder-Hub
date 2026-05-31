import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AvatarCircle } from "./avatar-circle";
import { Pill } from "./pill";
import { GIG_TYPE_LABEL, gigBudgetLabel, type GigWithPoster } from "@/lib/gigs";

export function GigCard({ gig }: { gig: GigWithPoster }) {
  const budget = gigBudgetLabel(gig);
  return (
    <Link
      href={`/gigs/${gig.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-border-hover hover:shadow-[var(--shadow-md)]"
    >
      <div className="flex items-center justify-between gap-2">
        <Pill accent="orange">{GIG_TYPE_LABEL[gig.type]}</Pill>
        {gig.status !== "open" && (
          <Pill accent="neutral">
            {gig.status === "in_progress" ? "In progress" : "Closed"}
          </Pill>
        )}
      </div>
      <h3 className="mt-3 line-clamp-2 font-display text-lg font-bold text-ink" dir="auto">
        {gig.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground" dir="auto">
        {gig.description}
      </p>
      {budget && <p className="mt-3 text-sm font-medium text-ink">{budget}</p>}
      <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
        {gig.poster && (
          <>
            <AvatarCircle
              name={gig.poster.name}
              src={gig.poster.avatar_url}
              size={24}
              accent="orange"
            />
            <span className="truncate text-sm text-muted-foreground">
              {gig.poster.name}
            </span>
          </>
        )}
        <ArrowRight
          size={15}
          className="ml-auto shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </Link>
  );
}
