import Link from "next/link";
import {
  ArrowRight,
  Search,
  Hammer,
  Coins,
  Compass,
  LayoutGrid,
  Users,
  Briefcase,
  Trophy,
} from "lucide-react";
import { Container, Section, Eyebrow } from "@/components/brand/layout";
import { Reveal } from "@/components/brand/reveal";
import { Sparkle } from "@/components/brand/sparkle";
import { ProjectCard } from "@/components/brand/project-card";
import {
  getLandingStats,
  listProjects,
  getMyUpvotedProjectIds,
} from "@/lib/queries";
import { getAuthUser } from "@/lib/current-user";

/** Tappable category chips → jump into a filtered Showcase. */
const CATEGORIES = [
  "Community",
  "Productivity",
  "Developer Tools",
  "AI",
  "Education",
  "Finance",
  "Automation",
  "Design",
];

const AUDIENCES = [
  {
    tag: "I build",
    title: "Show what you made",
    body: "Post an app, a tool, a site. Add a screenshot or a live link, tag how you built it, and let the community find it.",
    cta: "Post a project",
    href: "/showcase/submit",
    tint: "tint-teal",
    Icon: Hammer,
  },
  {
    tag: "I'm looking",
    title: "Find, hire & invest",
    body: "Browse what the community is building. Reach the people behind it to hire, fund, buy, or partner — no tech background needed.",
    cta: "Browse builders",
    href: "/builders",
    tint: "tint-gold",
    Icon: Coins,
  },
  {
    tag: "I'm curious",
    title: "Just look around",
    body: "New to all of this? Explore freely — no account required. See what's possible when the community builds together.",
    cta: "Explore the showcase",
    href: "/showcase",
    tint: "tint-blue",
    Icon: Compass,
  },
];

const FEATURES = [
  {
    title: "Showcase",
    body: "Show off what you built. Upvote the best.",
    href: "/showcase",
    tint: "tint-teal",
    Icon: LayoutGrid,
  },
  {
    title: "Builder Directory",
    body: "Find builders by skill, tool, or vibe.",
    href: "/directory",
    tint: "tint-blue",
    Icon: Users,
  },
  {
    title: "Gig Board",
    body: "Post a gig, get applicants, manage it in one place.",
    href: "/gigs",
    tint: "tint-orange",
    Icon: Briefcase,
  },
  {
    title: "Competitions",
    body: "Post a bounty. Anyone submits. You pick the winner.",
    href: "/competitions",
    tint: "tint-gold",
    Icon: Trophy,
  },
];

function Stat({ value, label, gold }: { value: number; label: string; gold?: boolean }) {
  return (
    <div className="text-center">
      <div
        className={`font-display text-4xl font-bold leading-none tracking-tight md:text-5xl ${
          gold ? "text-amber-500" : "text-ink"
        }`}
      >
        {value}
      </div>
      <div className="mt-2 text-[13px] text-muted-foreground">{label}</div>
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
      {/* ───── Hero ───── */}
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%)",
          }}
        >
          <div
            className="absolute -top-28 left-1/2 h-[460px] w-[760px] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
            style={{ background: "radial-gradient(closest-side, var(--teal-100), transparent 72%)" }}
          />
          <div
            className="absolute -top-10 right-[10%] h-[320px] w-[320px] rounded-full opacity-50 blur-3xl"
            style={{ background: "radial-gradient(closest-side, var(--gold-100), transparent 72%)" }}
          />
          <div
            className="absolute top-20 left-[6%] h-[300px] w-[300px] rounded-full opacity-40 blur-3xl"
            style={{ background: "radial-gradient(closest-side, var(--blue-bg), transparent 72%)" }}
          />
        </div>

        <Container className="flex flex-col items-center py-20 text-center md:py-28">
          <span className="badge-pill">
            <Sparkle size={14} />
            The home for our community&apos;s builders
          </span>

          <h1 className="mt-6 max-w-[14ch] font-display text-[clamp(2.6rem,7vw,5rem)] font-bold leading-[1.05] tracking-tight text-ink">
            Discover what the community is{" "}
            <span className="text-teal-600">building</span>
          </h1>

          <p className="mt-6 max-w-[46ch] text-[clamp(1.05rem,2.2vw,1.3rem)] leading-relaxed text-muted-foreground">
            Apps, tools and ideas — made by the people in our community, for the
            people in our community. Find them, back them, or build your own.
          </p>

          {/* Working search → /showcase?q= */}
          <form
            action="/showcase"
            method="get"
            className="mt-8 flex w-full max-w-[560px] items-center gap-2 rounded-full border border-border bg-surface p-2 pl-5 shadow-[var(--shadow-md)]"
          >
            <Search size={18} className="shrink-0 text-muted-foreground" />
            <input
              name="q"
              dir="auto"
              placeholder="Search projects, builders, tools…"
              aria-label="Search"
              className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted-foreground"
            />
            <button type="submit" className="btn btn-primary btn-sm">
              Search
            </button>
          </form>

          <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href="/showcase" className="btn btn-primary btn-lg">
              Explore the Showcase <ArrowRight size={18} />
            </Link>
            <Link href="/builders" className="btn btn-ghost btn-lg">
              Browse builders
            </Link>
          </div>

          <div className="mt-12 flex items-center gap-8 sm:gap-14">
            <Stat value={stats.projects} label="Projects" />
            <div className="h-9 w-px bg-border" />
            <Stat value={stats.builders} label="Builders" />
            <div className="h-9 w-px bg-border" />
            <Stat value={stats.gigs} label="Open gigs" gold />
          </div>
        </Container>
      </section>

      {/* ───── Category chips ───── */}
      <Container className="pt-10">
        <Reveal className="flex flex-wrap items-center justify-center gap-2.5">
          <span className="mr-1 text-sm text-muted-foreground">Browse by:</span>
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/showcase?tag=${encodeURIComponent(c)}`}
              className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm text-ink transition-colors hover:border-border-hover hover:bg-secondary"
            >
              {c}
            </Link>
          ))}
        </Reveal>
      </Container>

      {/* ───── There's a place for you here ───── */}
      <Section>
        <Container>
          <Reveal>
            <Eyebrow>However you show up</Eyebrow>
            <h2 className="mt-3.5 font-display text-[clamp(1.9rem,4vw,2.75rem)] font-bold tracking-tight text-ink">
              There&apos;s a place for you here
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {AUDIENCES.map((a, i) => {
              const Icon = a.Icon;
              return (
                <Reveal key={a.tag} delay={i * 80}>
                  <div className="group flex h-full flex-col rounded-3xl border border-border bg-surface p-7 transition-all hover:-translate-y-0.5 hover:border-border-hover hover:shadow-[var(--shadow-md)]">
                    <span className={`grid h-12 w-12 place-items-center rounded-[14px] ${a.tint}`}>
                      <Icon size={22} />
                    </span>
                    <span className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {a.tag}
                    </span>
                    <h3 className="mt-1.5 font-display text-2xl font-bold text-ink">
                      {a.title}
                    </h3>
                    <p className="mt-2.5 flex-1 text-[15px] leading-relaxed text-muted-foreground">
                      {a.body}
                    </p>
                    <Link href={a.href} className="link-arrow mt-5">
                      {a.cta} <ArrowRight size={16} />
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* ───── Everything you need ───── */}
      <Section>
        <Container>
          <Reveal>
            <Eyebrow>Everything in one place</Eyebrow>
            <h2 className="mt-3.5 font-display text-[clamp(1.9rem,4vw,2.75rem)] font-bold tracking-tight text-ink">
              Everything you need
            </h2>
            <p className="mt-3 max-w-[50ch] text-[17px] text-muted-foreground">
              A simple home for showing your work, finding people, and doing
              business — together.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => {
              const Icon = f.Icon;
              return (
                <Reveal key={f.title} delay={i * 70}>
                  <Link
                    href={f.href}
                    className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-all hover:-translate-y-0.5 hover:border-border-hover hover:shadow-[var(--shadow-sm)]"
                  >
                    <span className={`grid h-10 w-10 place-items-center rounded-xl ${f.tint}`}>
                      <Icon size={20} />
                    </span>
                    <h3 className="mt-4 font-semibold text-ink">{f.title}</h3>
                    <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {f.body}
                    </p>
                    <span className="link-arrow mt-4 text-sm">
                      Explore <ArrowRight size={14} />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* ───── Fresh from the Showcase ───── */}
      <Section>
        <Container>
          <Reveal className="flex items-end justify-between gap-6">
            <div>
              <Eyebrow>Just shipped</Eyebrow>
              <h2 className="mt-3.5 font-display text-[clamp(1.9rem,4vw,2.75rem)] font-bold tracking-tight text-ink">
                Fresh from the Showcase
              </h2>
            </div>
            <Link href="/showcase" className="link-arrow shrink-0">
              See all <ArrowRight size={16} />
            </Link>
          </Reveal>

          {topProjects.length > 0 ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {topProjects.map((p, i) => (
                <Reveal key={p.id} delay={i * 80}>
                  <ProjectCard
                    project={p}
                    isAuthed={isAuthed}
                    upvoted={upvoted.has(p.id)}
                  />
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal className="mt-10">
              <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-surface px-6 py-16 text-center">
                <Sparkle size={26} color="var(--teal-400)" />
                <h3 className="mt-4 font-display text-xl font-bold text-ink">
                  Nothing here yet
                </h3>
                <p className="mt-1.5 max-w-sm text-[15px] text-muted-foreground">
                  Be the first to show what you built — your project lands here
                  and on your profile.
                </p>
                <Link href="/showcase/submit" className="btn btn-primary mt-6">
                  Submit a project
                </Link>
              </div>
            </Reveal>
          )}
        </Container>
      </Section>

      {/* ───── Ready to vibe? ───── */}
      <Section className="pb-4">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-[28px] bg-teal-700 px-6 py-16 text-center md:py-20">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(120% 90% at 50% -30%, rgba(255,255,255,.08), transparent 60%)",
                }}
              />
              <h2 className="relative font-display text-[clamp(2rem,5vw,3.25rem)] font-bold text-white">
                Ready to vibe?
              </h2>
              <p className="relative mx-auto mt-4 max-w-md text-[17px] text-white/80">
                Join the place where builders, businesses, and curious minds meet.
              </p>
              <div className="relative mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href={isAuthed ? "/showcase/submit" : "/signup"}
                  className="btn btn-lg bg-white text-teal-800 hover:bg-white/90"
                >
                  Get started
                </Link>
                <Link href="/showcase" className="btn btn-gold btn-lg">
                  Explore <ArrowRight size={18} />
                </Link>
              </div>
              <p className="relative mt-6 text-sm text-white/75">
                New here?{" "}
                <Link
                  href="/docs"
                  className="font-semibold text-white underline underline-offset-4"
                >
                  See how YidVibe works
                </Link>
              </p>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
