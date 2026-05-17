import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { db, freelancersTable, gigsTable, showcaseProjectsTable, competitionsTable } from "@/lib/db";
import { sql } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Users, Star, Briefcase, Zap, Code2, Rocket, Trophy, ArrowRight, ArrowLeft } from "lucide-react";
import DirIcon from "@/components/DirIcon";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const t = await getTranslations("landing");

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

  const features = [
    { Icon: Trophy, title: t("features.competitions.title"), desc: t("features.competitions.desc") },
    { Icon: Briefcase, title: t("features.gigs.title"), desc: t("features.gigs.desc") },
    { Icon: Users, title: t("features.builders.title"), desc: t("features.builders.desc") },
    { Icon: Star, title: t("features.showcase.title"), desc: t("features.showcase.desc") },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="py-20 md:py-28 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
          <Zap size={12} /> {t("badge")}
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
          {t("hero.title1")} <span className="text-primary">{t("hero.highlight")}</span>
          <br />
          {t("hero.title2")}
        </h1>
        <p className="mt-5 text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          {t("hero.subtitle")}
        </p>
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <Link href="/competitions">
            <Button size="lg" className="gap-2">
              <Trophy size={16} /> {t("cta.browseCompetitions")} <DirIcon ltr={ArrowRight} rtl={ArrowLeft} size={16} />
            </Button>
          </Link>
          <Link href="/freelancers">
            <Button size="lg" variant="outline" className="gap-2">
              <Users size={16} /> {t("cta.browseBuilders")}
            </Button>
          </Link>
        </div>

        {/* Social proof counters */}
        {(freelancers + gigs + projects + competitions) > 0 && (
          <div className="mt-10 flex items-center justify-center gap-8 text-sm">
            {competitions > 0 && (
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold">{competitions}</span>
                <span className="text-muted-foreground">{t("counters.competitions")}</span>
              </div>
            )}
            {freelancers > 0 && (
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold">{freelancers}</span>
                <span className="text-muted-foreground">{t("counters.builders")}</span>
              </div>
            )}
            {gigs > 0 && (
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold">{gigs}</span>
                <span className="text-muted-foreground">{t("counters.gigs")}</span>
              </div>
            )}
            {projects > 0 && (
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold">{projects}</span>
                <span className="text-muted-foreground">{t("counters.projects")}</span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="py-16 border-t border-border">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-center text-sm font-medium text-muted-foreground uppercase tracking-widest mb-8">
            {t("featuresHeader")}
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
            {t("outro.title")}
          </h2>
          <p className="mt-3 text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
            {t("outro.subtitle")}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2">
                {t("cta.getStarted")} <Rocket size={16} />
              </Button>
            </Link>
            <Link href="/freelancers">
              <Button size="lg" variant="ghost">
                {t("cta.explore")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
