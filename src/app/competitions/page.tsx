import Link from "next/link";
import { Plus, Trophy } from "lucide-react";
import { listCompetitions } from "@/lib/competitions";
import { Container } from "@/components/brand/layout";
import { PageHeader } from "@/components/brand/page-header";
import { CompetitionCard } from "@/components/brand/competition-card";
import { EmptyState } from "@/components/brand/empty-state";
import {
  CompetitionsBoard,
  type CompetitionFilterItem,
} from "@/components/competitions/competitions-board";

export const metadata = {
  title: "Competitions",
  description: "Post a bounty. Anyone submits. You pick the winner.",
};

export default async function CompetitionsPage() {
  const competitions = await listCompetitions();

  // Filter on plain fields client-side; cards stay server-rendered.
  const items: CompetitionFilterItem[] = competitions.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    prize_amount: c.prize_amount,
    deadline: c.deadline,
    hasWinner: !!c.winner_submission_id,
    tags: c.tags ?? [],
  }));
  const cards = Object.fromEntries(
    competitions.map((c) => [c.id, <CompetitionCard key={c.id} competition={c} />]),
  );

  return (
    <Container className="py-10 md:py-14">
      <PageHeader
        accent="clay"
        eyebrow="Compete"
        icon={<Trophy size={22} />}
        title="Competitions"
        subtitle="Post a bounty. Anyone submits. You pick the winner."
        action={
          <Link href="/competitions/post" className="btn btn-gold shrink-0">
            <Plus size={16} /> Post a competition
          </Link>
        }
      />

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
        <CompetitionsBoard items={items} cards={cards} />
      )}
    </Container>
  );
}
