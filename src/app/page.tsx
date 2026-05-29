import Link from "next/link";
import {
  ArrowRight,
  Trophy,
  Briefcase,
  Users,
  LayoutGrid,
} from "lucide-react";
import { AmbientHero } from "@/components/brand/ambient-hero";
import { ProjectCard } from "@/components/brand/project-card";
import {
  getLandingStats,
  listProjects,
  getMyUpvotedProjectIds,
} from "@/lib/queries";
import { getAuthUser } from "@/lib/current-user";

const FEATURES = [
  {
    title: "Competitions",
    body: "Post a bounty. Anyone submits. You pick the winner.",
    href: "/competitions",
    icon: Trophy,
    chip: "bg-clay-tint text-clay-deep",
  },
  {
    title: "Gig Board",
    body: "Post a gig, get applicants, manage it all in one place.",
    href: "/gigs",
    icon: Briefcase,
    chip: "bg-orange-tint text-orange-deep",
  },
  {
    title: "Builder Directory",
    body: "Find builders by skill, tool, or vibe. Every one ships fast.",
    href: "/directory",
    icon: Users,
    chip: "bg-blue-tint text-blue-deep",
  },
  {
    title: "Showcase",
    body: "Show off what you built. Upvote the best.",
    href: "/showcase",
    icon: LayoutGrid,
    chip: "bg-teal-50 text-teal-800",
  },
];

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-4xl text-ink md:text-5xl">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

export default async function Home() {
  const [stats, topProjects, upvoted, user] = await Promise.all([
    getLandingStats(),
    listProjects({ sort: "top", limit: 3 }),
    getMyUpvotedProjectIds(),
    getAuthUser(),
  ]);
  const isAuthed = !!user;

  return (
    <>
      {/* Hero */}
      <AmbientHero className="px-4">
        <div className="mx-auto flex max-w-[1120px] flex-col items-center py-20 text-center md:py-28">
          <span className="yv-rise rounded-full border border-border bg-surface/70 px-3 py-1 text-xs text-muted-foreground">
            The Jewish AI marketplace
          </span>
          <h1 className="yv-rise mt-6 font-display text-[2.5rem] leading-[1.05] text-ink md:text-[3.25rem]">
            Discover AI apps
            <br />
            <span className="text-teal-600">and tools</span>
          </h1>
          <p className="yv-rise mt-5 max-w-md text-[15px] text-muted-foreground md:text-base">
            Explore Jewish projects built by the community.
          </p>
          <div className="yv-rise mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/showcase"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-teal-600 px-6 text-[15px] font-medium text-white transition-transform active:scale-[0.98]"
            >
              Explore the Showcase
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/builders"
              className="inline-flex h-11 items-center justify-center rounded-[10px] border border-border bg-surface px-6 text-[15px] font-medium text-ink transition-colors hover:bg-secondary"
            >
              Browse Builders
            </Link>
          </div>

          <div className="yv-rise mt-14 flex items-center gap-10 sm:gap-16">
            <Stat value={stats.builders} label="Builders" />
            <Stat value={stats.gigs} label="Open gigs" />
            <Stat value={stats.projects} label="Projects" />
          </div>
        </div>
      </AmbientHero>

      {/* Two doors */}
      <section className="mx-auto max-w-[1120px] px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-card border border-border bg-teal-50/60 p-6 md:p-8">
            <p className="text-sm font-medium text-teal-800">For builders</p>
            <h2 className="mt-2 font-display text-2xl text-ink">
              Show what you built
            </h2>
            <p className="mt-2 text-[15px] text-muted-foreground">
              Post a project, build your profile, get discovered by people with
              ideas and money.
            </p>
            <div className="mt-5 flex flex-wrap gap-4">
              <Link
                href="/showcase/submit"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-800 hover:underline"
              >
                Post a project <ArrowRight size={15} />
              </Link>
              <Link
                href="/settings/profile"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-800 hover:underline"
              >
                Create your profile <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          <div className="rounded-card border border-border bg-blue-tint/50 p-6 md:p-8">
            <p className="text-sm font-medium text-blue-deep">For businesses</p>
            <h2 className="mt-2 font-display text-2xl text-ink">
              Find what&apos;s possible
            </h2>
            <p className="mt-2 text-[15px] text-muted-foreground">
              Browse AI-built projects, hire the builders behind them, or post a
              gig or competition.
            </p>
            <div className="mt-5 flex flex-wrap gap-4">
              <Link
                href="/showcase"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-deep hover:underline"
              >
                Explore the Showcase <ArrowRight size={15} />
              </Link>
              <Link
                href="/directory"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-deep hover:underline"
              >
                Browse the directory <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Everything you need */}
      <section className="mx-auto max-w-[1120px] px-4 py-12 md:px-6">
        <h2 className="font-display text-2xl text-ink md:text-3xl">
          Everything you need
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Link
                key={f.title}
                href={f.href}
                className="group flex flex-col rounded-card border border-border bg-surface p-5 transition-colors hover:border-border-hover"
              >
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-chip ${f.chip}`}
                >
                  <Icon size={20} />
                </span>
                <h3 className="mt-4 font-medium text-ink">{f.title}</h3>
                <p className="mt-1.5 flex-1 text-sm text-muted-foreground">
                  {f.body}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-teal-800">
                  Explore
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Live showcase strip */}
      {topProjects.length > 0 && (
        <section className="mx-auto max-w-[1120px] px-4 py-12 md:px-6">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl text-ink md:text-3xl">
              Fresh from the Showcase
            </h2>
            <Link
              href="/showcase"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-800 hover:underline"
            >
              See all <ArrowRight size={15} />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topProjects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                isAuthed={isAuthed}
                upvoted={upvoted.has(p.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Closing CTA */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-[1120px] overflow-hidden rounded-card border border-border bg-teal-600 px-6 py-14 text-center md:py-20">
          <h2 className="font-display text-3xl text-white md:text-4xl">
            Ready to vibe?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-white/85">
            Join the marketplace where builders meet projects that move.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-[10px] bg-white px-6 text-[15px] font-medium text-teal-800 transition-transform active:scale-[0.98]"
            >
              Get started
            </Link>
            <Link
              href="/showcase"
              className="inline-flex h-11 items-center justify-center rounded-[10px] border border-white/40 px-6 text-[15px] font-medium text-white transition-colors hover:bg-white/10"
            >
              Explore
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/75">
            New here?{" "}
            <Link href="/docs" className="font-medium text-white underline underline-offset-4">
              See how YidVibe works
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
