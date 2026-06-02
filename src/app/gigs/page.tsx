import Link from "next/link";
import { Plus, Briefcase } from "lucide-react";
import { listGigs } from "@/lib/gigs";
import { Container } from "@/components/brand/layout";
import { PageHeader } from "@/components/brand/page-header";
import { GigCard } from "@/components/brand/gig-card";
import { EmptyState } from "@/components/brand/empty-state";
import { GigsBoard, type GigFilterItem } from "@/components/gigs/gigs-board";

export const metadata = {
  title: "Gigs",
  description: "Post a gig, get applicants, manage it all in one place.",
};

export default async function GigsPage() {
  const gigs = await listGigs({ status: "open" });

  // Filter on plain fields client-side; cards stay server-rendered (the card
  // imports the server-only gigs lib, so we hand it down as ready nodes).
  const items: GigFilterItem[] = gigs.map((g) => ({
    id: g.id,
    title: g.title,
    description: g.description,
    type: g.type,
    budget_min: g.budget_min,
    budget_max: g.budget_max,
    hourly_rate: g.hourly_rate,
    tags: g.tags ?? [],
  }));
  // Only the single newest open gig wears the #1 medal in the default listing.
  const topGigId = gigs[0]?.id;
  const cards = Object.fromEntries(
    gigs.map((g) => [
      g.id,
      <GigCard key={g.id} gig={g} topRank={g.id === topGigId} />,
    ]),
  );

  return (
    <Container className="py-10 md:py-14">
      <PageHeader
        accent="gold"
        eyebrow="Work"
        title="Gigs"
        subtitle="Post a gig, get applicants, manage it all in one place."
        action={
          <Link href="/gigs/post" className="btn btn-orange shrink-0">
            <Plus size={16} /> Post a gig
          </Link>
        }
      />

      {gigs.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<Briefcase size={22} />}
          title="No open gigs yet"
          description="Post the first gig and start hiring builders from the community."
          actionHref="/gigs/post"
          actionLabel="Post a gig"
        />
      ) : (
        <GigsBoard items={items} cards={cards} />
      )}
    </Container>
  );
}
