import Link from "next/link";
import { ArrowRight, Medal } from "lucide-react";
import { AvatarCircle } from "./avatar-circle";
import { OfficialAuthor } from "./official-author";
import { Pill } from "./pill";
import { GIG_TYPE_LABEL, gigBudgetLabel, type GigWithPoster } from "@/lib/gigs";
import { displayName } from "@/lib/display";

export function GigCard({
  gig,
  topRank = false,
}: {
  gig: GigWithPoster;
  topRank?: boolean;
}) {
  const budget = gigBudgetLabel(gig);
  const official = (gig as { posted_as_official?: boolean }).posted_as_official === true;
  return (
    <Link
      href={`/gigs/${gig.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-border-hover hover:shadow-[var(--shadow-md)]"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Pill accent="orange">{GIG_TYPE_LABEL[gig.type]}</Pill>
          {topRank && (
            <span className="yv-medal-chip">
              <Medal size={12} /> #1
            </span>
          )}
        </div>
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
        {official ? (
          <OfficialAuthor />
        ) : (
          gig.poster && (
            <>
              <AvatarCircle
                name={displayName(gig.poster)}
                src={gig.poster.avatar_url}
                size={24}
                accent="orange"
              />
              <span className="truncate text-sm text-muted-foreground">
                {displayName(gig.poster)}
              </span>
            </>
          )
        )}
        <ArrowRight
          size={15}
          className="ml-auto shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </Link>
  );
}
