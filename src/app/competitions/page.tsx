import Link from "next/link";
import { Plus, Trophy } from "lucide-react";
import { listCompetitions, countCompetitions } from "@/lib/competitions";
import { Container, Eyebrow } from "@/components/brand/layout";
import { CompetitionCard } from "@/components/brand/competition-card";
import { EmptyState } from "@/components/brand/empty-state";
import { Pagination } from "@/components/brand/pagination";

export const metadata = {
  title: "Competitions",
  description: "Post a bounty. Anyone submits. You pick the winner.",
};

const PER_PAGE = 24;

export default async function CompetitionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const [competitions, total] = await Promise.all([
    listCompetitions({ page, perPage: PER_PAGE }),
    countCompetitions(),
  ]);
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <Container className="py-10 md:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow style={{ color: "var(--gold-700)" }}>Build &amp; win</Eyebrow>
          <h1 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.25rem)] font-bold tracking-tight text-ink">
            Competitions
          </h1>
          <p className="mt-2 text-[17px] text-muted-foreground">
            Post a bounty. Anyone submits. You pick the winner.
          </p>
        </div>
        <Link href="/competitions/post" className="btn btn-gold shrink-0">
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
        <>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {competitions.map((c) => (
              <CompetitionCard key={c.id} competition={c} />
            ))}
          </div>
          <Pagination
            pathname="/competitions"
            searchParams={sp}
            page={page}
            totalPages={totalPages}
          />
        </>
      )}
    </Container>
  );
}
