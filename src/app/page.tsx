import Link from "next/link";
import {
  ArrowRight,
  Search,
  Hammer,
  Coins,
  Compass,
  Users,
  ChevronUp,
} from "lucide-react";
import { Container, Section, Eyebrow } from "@/components/brand/layout";
import { Reveal } from "@/components/brand/reveal";
import { Sparkle } from "@/components/brand/sparkle";
import { BrowseBy } from "@/components/brand/browse-by";
import { RotatingRow } from "@/components/brand/rotating-row";
import { AvatarCircle } from "@/components/brand/avatar-circle";
import {
  getLandingStats,
  listProjects,
  listTopBuilders,
  getBrowseTags,
} from "@/lib/queries";
import { getAuthUser } from "@/lib/current-user";

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
    title: "Find & hire",
    body: "Browse what the community is building. Reach the people behind it to hire, buy, or partner — no tech background needed.",
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
  const [stats, topProjects, topBuilders, tags, user] = await Promise.all([
    getLandingStats(),
    listProjects({ sort: "top", limit: 5 }),
    listTopBuilders(5),
    getBrowseTags(),
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
            people in our community. Find them, support them, or build your own
            — it&apos;s all free.
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

      {/* ───── Browse by (tag marquee) ───── */}
      <Container className="pt-10">
        <BrowseBy tags={tags} />
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

      {/* ───── Top Projects ───── */}
      <Section>
        <Container>
          <Reveal className="flex items-end justify-between gap-6">
            <div>
              <Eyebrow>Just shipped</Eyebrow>
              <h2 className="mt-3.5 font-display text-[clamp(1.9rem,4vw,2.75rem)] font-bold tracking-tight text-ink">
                Top Projects
              </h2>
            </div>
            <Link href="/showcase" className="link-arrow shrink-0">
              Browse projects <ArrowRight size={16} />
            </Link>
          </Reveal>

          {topProjects.length > 0 ? (
            <Reveal className="mt-10">
              <RotatingRow>
                {topProjects.map((p) => {
                  const external = !!p.url;
                  const href = p.url || `/showcase/${p.id}`;
                  return (
                    <div
                      key={p.id}
                      className="h-full overflow-hidden rounded-2xl border border-border bg-surface"
                    >
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="h-32 w-full object-cover"
                        />
                      ) : (
                        <div
                          className="flex h-32 w-full items-center justify-center font-display text-4xl font-bold text-teal-700"
                          style={{
                            background:
                              "linear-gradient(135deg, var(--teal-50), var(--gold-50))",
                          }}
                        >
                          {p.name.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-2 p-3">
                        <Link
                          href={href}
                          target={external ? "_blank" : undefined}
                          rel={external ? "noopener noreferrer" : undefined}
                          className="truncate font-display font-bold text-ink hover:text-teal-700"
                        >
                          {p.name}
                        </Link>
                        <span className="inline-flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-[10px] border border-teal-100 bg-teal-50 text-xs font-bold leading-none text-teal-800">
                          <ChevronUp size={12} />
                          {p.upvote_count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </RotatingRow>
            </Reveal>
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

      {/* ───── Top Creators ───── */}
      {topBuilders.length > 0 && (
        <Section>
          <Container>
            <Reveal className="flex items-end justify-between gap-6">
              <div>
                <Eyebrow>The people behind it</Eyebrow>
                <h2 className="mt-3.5 font-display text-[clamp(1.9rem,4vw,2.75rem)] font-bold tracking-tight text-ink">
                  Top Creators
                </h2>
              </div>
              <Link href="/builders" className="link-arrow shrink-0">
                Browse builders <ArrowRight size={16} />
              </Link>
            </Reveal>

            <Reveal className="mt-10">
              <RotatingRow>
                {topBuilders.map((b, i) => (
                  <Link
                    key={b.id}
                    href={`/u/${b.handle}`}
                    className="group flex h-full flex-col items-center rounded-2xl border border-border bg-surface p-5 text-center transition-all hover:-translate-y-0.5 hover:border-border-hover hover:shadow-[var(--shadow-sm)]"
                  >
                    <span className="relative mx-auto w-fit">
                      <AvatarCircle
                        name={b.name}
                        src={b.avatar_url}
                        size={72}
                        className={i === 0 ? "yv-ring-gold" : undefined}
                      />
                      {i < 3 && (
                        <span className={`yv-medal yv-medal-${i + 1}`}>
                          {i + 1}
                        </span>
                      )}
                    </span>
                    <span className="mt-3 font-bold text-ink group-hover:text-teal-700">
                      {b.name}
                    </span>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Users size={12} /> {b.follower_count} followers
                    </span>
                  </Link>
                ))}
              </RotatingRow>
            </Reveal>
          </Container>
        </Section>
      )}

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
