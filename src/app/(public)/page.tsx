import Link from "next/link";
import { db, freelancersTable, gigsTable, showcaseProjectsTable, competitionsTable } from "@/lib/db";
import { sql } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Users, Star, Briefcase, ArrowRight, Zap, Code2, Rocket, Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

const features = [
  {
    Icon: Trophy,
    title: "Competitions",
    desc: "Post a bounty, invite anyone to submit entries, pick a winner. 99designs-style.",
  },
  {
    Icon: Briefcase,
    title: "Gig Board",
    desc: "Post 1-on-1 gigs, get applications, manage conversations — all in one place.",
  },
  {
    Icon: Users,
    title: "Builder Directory",
    desc: "Find AI-native freelancers by skill, tool, or vibe. Every builder ships fast.",
  },
  {
    Icon: Star,
    title: "Showcase",
    desc: "Show off vibe-coded projects. Upvote the best builds from the community.",
  },
];

export default async function LandingPage() {
  const [fc, gc, sc, cc] = await Promise.all([
    db.select({ c: sql<number>`count(*)::int` }).from(freelancersTable),
    db.select({ c: sql<number>`count(*)::int` }).from(gigsTable),
    db.select({ c: sql<number>`count(*)::int` }).from(showcaseProjectsTable),
    db.select({ c: sql<number>`count(*)::int` }).from(competitionsTable),
  ]);
  const freelancers = fc[0]?.c ?? 0;
  const gigs = gc[0]?.c ?? 0;
  const projects = sc[0]?.c ?? 0;
  const competitions = cc[0]?.c ?? 0;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="py-20 md:py-28 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
          <Zap size={12} /> AI-native marketplace
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
          Where <span className="text-primary">vibe coders</span>
          <br />
          find work &amp; ship fast
        </h1>
        <p className="mt-5 text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          The hub for builders who code with AI. Browse freelancers, post gigs,
          and showcase your projects — all in one place.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <Link href="/competitions">
            <Button size="lg" className="gap-2">
              <Trophy size={16} /> Browse Competitions <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/freelancers">
            <Button size="lg" variant="outline" className="gap-2">
              <Users size={16} /> Browse Builders
            </Button>
          </Link>
        </div>

        {/* Social proof counters */}
        {(freelancers + gigs + projects + competitions) > 0 && (
          <div className="mt-10 flex items-center justify-center gap-8 text-sm">
            {competitions > 0 && (
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold">{competitions}</span>
                <span className="text-muted-foreground">Competitions</span>
              </div>
            )}
            {freelancers > 0 && (
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold">{freelancers}</span>
                <span className="text-muted-foreground">Builders</span>
              </div>
            )}
            {gigs > 0 && (
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold">{gigs}</span>
                <span className="text-muted-foreground">Gigs</span>
              </div>
            )}
            {projects > 0 && (
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold">{projects}</span>
                <span className="text-muted-foreground">Projects</span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="py-16 border-t border-border">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-center text-sm font-medium text-muted-foreground uppercase tracking-widest mb-8">
            Everything you need
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="border border-border rounded-lg p-6 hover:border-primary/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <f.Icon size={20} />
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center border-t border-border">
        <div className="max-w-2xl mx-auto px-4">
          <Code2 size={28} className="mx-auto text-primary mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Ready to vibe?
          </h2>
          <p className="mt-3 text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
            Join the marketplace where AI-native builders connect with projects
            that move fast.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2">
                Get Started <Rocket size={16} />
              </Button>
            </Link>
            <Link href="/freelancers">
              <Button size="lg" variant="ghost">
                Explore
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
