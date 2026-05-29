import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { listBuilders } from "@/lib/queries";
import { BuilderCard } from "@/components/brand/builder-card";
import { EmptyState } from "@/components/brand/empty-state";

export const metadata = {
  title: "Builders",
  description: "Meet the builders shipping AI projects in the community.",
};

export default async function BuildersPage() {
  const [available, newest] = await Promise.all([
    listBuilders({ availableOnly: true, sort: "new", limit: 6 }),
    listBuilders({ sort: "new", limit: 18 }),
  ]);

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-10 md:px-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Builders</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Meet the people shipping AI apps and tools in the community.
          </p>
        </div>
        <Link
          href="/directory"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[10px] border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-secondary"
        >
          Search the full directory
          <ArrowRight size={16} />
        </Link>
      </div>

      {newest.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<Users size={22} />}
          title="No builders yet"
          description="Be the first to create a profile and show what you build."
          actionHref="/settings/profile"
          actionLabel="Create your profile"
        />
      ) : (
        <div className="mt-8 space-y-12">
          {available.length > 0 && (
            <section>
              <h2 className="mb-4 font-display text-xl text-ink">
                Available for hire
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {available.map((b) => (
                  <BuilderCard key={b.id} builder={b} />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-4 font-display text-xl text-ink">
              Newest builders
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {newest.map((b) => (
                <BuilderCard key={b.id} builder={b} />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
