import Link from "next/link";
import { Search } from "lucide-react";
import { listBuilders, getBuilderFacets } from "@/lib/queries";
import { Container, Eyebrow } from "@/components/brand/layout";
import { BuilderCard } from "@/components/brand/builder-card";
import { EmptyState } from "@/components/brand/empty-state";

export const metadata = {
  title: "Directory",
  description: "Find builders by skill, tool, or vibe.",
};

const controlClass =
  "h-11 rounded-xl border border-border bg-canvas px-3 text-sm font-medium text-ink outline-none transition-colors hover:border-border-hover focus:border-teal-600 focus:bg-surface";

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    tool?: string;
    skill?: string;
    available?: string;
  }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const tool = sp.tool ?? "";
  const skill = sp.skill ?? "";
  const availableOnly = sp.available === "1";
  const filtering = Boolean(q || tool || skill || availableOnly);

  const [facets, builders] = await Promise.all([
    getBuilderFacets(),
    listBuilders({
      q: q || undefined,
      tool: tool || undefined,
      skill: skill || undefined,
      availableOnly,
      sort: "new",
    }),
  ]);

  return (
    <Container className="py-10 md:py-14">
      <Eyebrow>Find your builder</Eyebrow>
      <h1 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.25rem)] font-bold tracking-tight text-ink">
        Directory
      </h1>
      <p className="mt-2 text-[17px] text-muted-foreground">
        Find builders by skill, tool, or vibe. Every one ships fast.
      </p>

      <form
        method="get"
        className="mt-7 flex flex-col gap-2.5 rounded-2xl border border-border bg-surface p-3 shadow-[var(--shadow-sm)] lg:flex-row lg:items-center"
      >
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            name="q"
            defaultValue={q}
            dir="auto"
            placeholder="Search builders…"
            className="h-11 w-full rounded-xl border border-transparent bg-canvas pl-10 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-600 focus:bg-surface"
          />
        </div>
        <select name="tool" defaultValue={tool} className={controlClass} aria-label="Tool">
          <option value="">All tools</option>
          {facets.tools.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select name="skill" defaultValue={skill} className={controlClass} aria-label="Skill">
          <option value="">All skills</option>
          {facets.skills.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <label className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-xl border border-border bg-canvas px-3.5 text-sm text-ink">
          <input
            type="checkbox"
            name="available"
            value="1"
            defaultChecked={availableOnly}
            className="h-4 w-4 rounded border-border accent-teal-600"
          />
          Available
        </label>
        <button type="submit" className="btn btn-primary btn-sm h-11">
          Search
        </button>
      </form>

      {filtering && (
        <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
          <span>
            <strong className="text-ink">{builders.length}</strong>{" "}
            {builders.length === 1 ? "result" : "results"}
          </span>
          <Link href="/directory" className="font-medium text-teal-800 hover:underline">
            Clear
          </Link>
        </div>
      )}

      {builders.length === 0 ? (
        <EmptyState
          className="mt-8"
          title={filtering ? "No builders found" : "No builders yet"}
          description={
            filtering
              ? "Try a broader search or clear your filters."
              : "Be the first to create a profile and show what you build."
          }
          actionHref={filtering ? "/directory" : "/settings/profile"}
          actionLabel={filtering ? "Clear filters" : "Create your profile"}
        />
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {builders.map((b) => (
            <BuilderCard key={b.id} builder={b} />
          ))}
        </div>
      )}
    </Container>
  );
}
