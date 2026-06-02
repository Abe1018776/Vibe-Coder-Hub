import Link from "next/link";
import { Plus, Briefcase } from "lucide-react";
import { listGigs } from "@/lib/gigs";
import { Container, Eyebrow } from "@/components/brand/layout";
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
  const cards = Object.fromEntries(gigs.map((g) => [g.id, <GigCard key={g.id} gig={g} />]));

  return (
    <Container className="py-10 md:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow style={{ color: "var(--orange-deep)" }}>Work &amp; hire</Eyebrow>
          <h1 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.25rem)] font-bold tracking-tight text-ink">
            Gigs
          </h1>
          <p className="mt-2 text-[17px] text-muted-foreground">
            Post a gig, get applicants, manage it all in one place.
          </p>
        </div>
        <Link href="/gigs/post" className="btn btn-orange shrink-0">
          <Plus size={16} /> Post a gig
        </Link>
      </div>

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
