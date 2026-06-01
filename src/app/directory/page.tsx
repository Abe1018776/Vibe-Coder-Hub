import Link from "next/link";
import { Plus, Compass } from "lucide-react";
import { listDirectoryListings, countDirectoryListings } from "@/lib/directory";
import { DIRECTORY_CATEGORIES } from "@/lib/site";
import { Container, Eyebrow } from "@/components/brand/layout";
import { ListingCard } from "@/components/brand/listing-card";
import { EmptyState } from "@/components/brand/empty-state";
import { FilterBar } from "@/components/brand/filter-bar";
import { Pagination } from "@/components/brand/pagination";

export const metadata = {
  title: "Directory",
  description: "A free listing of builders, makers, agencies and services.",
};

const PER_PAGE = 24;

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const category = sp.category ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const filtering = Boolean(q || category);

  const filterOpts = { q: q || undefined, category: category || undefined };
  const [total, listings] = await Promise.all([
    countDirectoryListings(filterOpts),
    listDirectoryListings({ ...filterOpts, page, perPage: PER_PAGE }),
  ]);
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <Container className="py-10 md:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow>Who&apos;s who online</Eyebrow>
          <h1 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.25rem)] font-bold tracking-tight text-ink">
            Directory
          </h1>
          <p className="mt-2 text-[17px] text-muted-foreground">
            A free listing of builders, makers, agencies and services in the community.
          </p>
        </div>
        <Link href="/directory/list" className="btn btn-primary shrink-0">
          <Plus size={16} /> Get listed — free
        </Link>
      </div>

      <FilterBar
        basePath="/directory"
        searchValue={q}
        placeholder="Search the directory…"
        selects={[
          {
            name: "category",
            allLabel: "All categories",
            value: category,
            options: [...DIRECTORY_CATEGORIES],
          },
        ]}
      />

      {listings.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<Compass size={22} />}
          title={filtering ? "No listings found" : "Nothing listed yet"}
          description={
            filtering
              ? "Try a broader search or clear your filters."
              : "Be the first — add yourself to the directory. It's free."
          }
          actionHref={filtering ? "/directory" : "/directory/list"}
          actionLabel={filtering ? "Clear filters" : "Get listed"}
        />
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
          <Pagination
            pathname="/directory"
            searchParams={sp}
            page={page}
            totalPages={totalPages}
          />
        </>
      )}
    </Container>
  );
}
