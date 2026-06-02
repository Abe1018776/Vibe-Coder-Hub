import { listBuilders, countBuilders, getBuilderFacets } from "@/lib/queries";
import { Container, Eyebrow } from "@/components/brand/layout";
import { BuilderCard } from "@/components/brand/builder-card";
import { EmptyState } from "@/components/brand/empty-state";
import { FilterBar } from "@/components/brand/filter-bar";
import { Pagination } from "@/components/brand/pagination";

export const metadata = {
  title: "Builders",
  description: "Meet the builders shipping AI projects in the community.",
};

const PER_PAGE = 24;

export default async function BuildersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    tool?: string;
    skill?: string;
    available?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const tool = sp.tool ?? "";
  const skill = sp.skill ?? "";
  const availableOnly = sp.available === "1";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const filtering = Boolean(q || tool || skill || availableOnly);

  const filterOpts = {
    q: q || undefined,
    tool: tool || undefined,
    skill: skill || undefined,
    availableOnly,
  };
  const [facets, total, builders] = await Promise.all([
    getBuilderFacets(),
    countBuilders(filterOpts),
    listBuilders({ ...filterOpts, sort: "new", page, perPage: PER_PAGE }),
  ]);
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <Container className="py-10 md:py-14">
      <Eyebrow>The people behind it</Eyebrow>
      <h1 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.25rem)] font-bold tracking-tight text-ink">
        Builders
      </h1>
      <p className="mt-2 text-[17px] text-muted-foreground">
        Meet the people shipping AI apps and tools in the community.
      </p>

      <FilterBar
        basePath="/builders"
        searchValue={q}
        placeholder="Search builders…"
        selects={[
          { name: "tool", allLabel: "All tools", value: tool, options: facets.tools },
          { name: "skill", allLabel: "All skills", value: skill, options: facets.skills },
        ]}
        toggles={[
          { name: "available", label: "Available for hire", value: availableOnly },
        ]}
      />

      {builders.length === 0 ? (
        <EmptyState
          className="mt-8"
          title={filtering ? "No builders found" : "No builders yet"}
          description={
            filtering
              ? "Try a broader search or clear your filters."
              : "Be the first to set up a builder profile and show what you build."
          }
          actionHref={filtering ? "/builders" : "/dashboard/profile"}
          actionLabel={filtering ? "Clear filters" : "Create your profile"}
        />
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {builders.map((b) => (
              <BuilderCard key={b.id} builder={b} />
            ))}
          </div>
          <Pagination
            pathname="/builders"
            searchParams={sp}
            page={page}
            totalPages={totalPages}
          />
        </>
      )}
    </Container>
  );
}
