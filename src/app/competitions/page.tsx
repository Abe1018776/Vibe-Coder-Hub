import Link from "next/link";
import { Plus, Trophy } from "lucide-react";
import { listCompetitions } from "@/lib/competitions";
import { CompetitionCard } from "@/components/brand/competition-card";
import { EmptyState } from "@/components/brand/empty-state";

export const metadata = {
  title: "Competitions",
  description: "Post a bounty. Anyone submits. You pick the winner.",
};

export default async function CompetitionsPage() {
  const competitions = await listCompetitions();

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-10 md:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Competitions</h1>
          <p className="mt-2 text-muted-foreground">
            Post a bounty. Anyone submits. You pick the winner.
          </p>
        </div>
        <Link
          href="/competitions/post"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[10px] bg-clay-mid px-4 text-sm font-medium text-white transition-transform active:scale-[0.98]"
        >
          <Plus size={16} /> Post a competition
        </Link>
      </div>

      {competitions.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<Trophy size={22} />}
          title="No competitions yet"
          description="Put up a prize and let the community build for it."
          actionHref="/competitions/post"
          actionLabel="Post a competition"
        />
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {competitions.map((c) => (
            <CompetitionCard key={c.id} competition={c} />
          ))}
        </div>
      )}
    </div>
  );
}
