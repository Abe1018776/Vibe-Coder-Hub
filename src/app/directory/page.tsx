import Link from "next/link";
import { Compass } from "lucide-react";
import { getAuthUser } from "@/lib/current-user";
import { listDirectoryListings, countDirectoryListings } from "@/lib/directory";
import { DIRECTORY_CATEGORIES } from "@/lib/site";
import { Container } from "@/components/brand/layout";
import { PageHeader } from "@/components/brand/page-header";
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
  const [total, listings, user] = await Promise.all([
    countDirectoryListings(filterOpts),
    listDirectoryListings({ ...filterOpts, page, perPage: PER_PAGE }),
    getAuthUser(),
  ]);
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <Container className="py-10 md:py-14">
      <PageHeader
        accent="blue"
        eyebrow="Connect"
        title="Directory"
        subtitle="A free listing of builders, makers, agencies and services in the community."
        action={
          user ? (
            <Link href="/directory/list-me" className="btn btn-primary shrink-0">
              <Compass size={16} /> Add me
            </Link>
          ) : (
            <Link
              href="/login?next=/directory/list-me"
              className="btn btn-primary shrink-0"
            >
              Sign up to get listed
            </Link>
          )
        }
      />

      {!user && (
        <p className="mt-3 text-sm text-muted-foreground">
          Prefer not to sign up?{" "}
          <Link
            href="/directory/list"
            className="font-semibold text-teal-800 hover:underline"
          >
            Submit the form
          </Link>{" "}
          and we&apos;ll review it.
        </p>
      )}

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
