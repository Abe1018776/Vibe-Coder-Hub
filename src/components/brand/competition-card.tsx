import Link from "next/link";
import { Trophy } from "lucide-react";
import { AvatarCircle } from "./avatar-circle";
import { Pill } from "./pill";
import {
  deadlineLabel,
  submissionCount,
  type CompetitionListItem,
} from "@/lib/competitions";

export function CompetitionCard({
  competition,
}: {
  competition: CompetitionListItem;
}) {
  const dl = deadlineLabel(competition.deadline);
  const entries = submissionCount(competition);
  const hasWinner = !!competition.winner_submission_id;

  return (
    <Link
      href={`/competitions/${competition.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-border-hover hover:shadow-[var(--shadow-md)]"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 font-display text-xl font-bold text-clay-deep">
          <Trophy size={18} />
          {"$" + competition.prize_amount.toLocaleString()}
        </span>
        {hasWinner ? (
          <Pill accent="gold">Winner picked</Pill>
        ) : (
          <Pill accent="clay">{dl.text}</Pill>
        )}
      </div>
      <h3 className="mt-3 line-clamp-2 font-display text-lg font-bold text-ink" dir="auto">
        {competition.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground" dir="auto">
        {competition.description}
      </p>
      <div className="mt-4 flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
        {competition.creator && (
          <>
            <AvatarCircle
              name={competition.creator.name}
              src={competition.creator.avatar_url}
              size={20}
              accent="clay"
            />
            <span className="truncate">{competition.creator.name}</span>
          </>
        )}
        <span className="ml-auto shrink-0">
          {entries} {entries === 1 ? "entry" : "entries"}
        </span>
      </div>
    </Link>
  );
}
