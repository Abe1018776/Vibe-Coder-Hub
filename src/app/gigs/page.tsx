import Link from "next/link";
import { Plus, Briefcase } from "lucide-react";
import { listGigs } from "@/lib/gigs";
import { GigCard } from "@/components/brand/gig-card";
import { EmptyState } from "@/components/brand/empty-state";

export const metadata = {
  title: "Gigs",
  description: "Post a gig, get applicants, manage it all in one place.",
};

export default async function GigsPage() {
  const gigs = await listGigs({ status: "open" });

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-10 md:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Gigs</h1>
          <p className="mt-2 text-muted-foreground">
            Post a gig, get applicants, manage it all in one place.
          </p>
        </div>
        <Link
          href="/gigs/post"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[10px] bg-orange-mid px-4 text-sm font-medium text-white transition-transform active:scale-[0.98]"
        >
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
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gigs.map((g) => (
            <GigCard key={g.id} gig={g} />
          ))}
        </div>
      )}
    </div>
  );
}
