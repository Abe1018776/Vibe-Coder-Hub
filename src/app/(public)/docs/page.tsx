import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  Users,
  Star,
  Briefcase,
  Calendar,
  Tag,
  MessageSquare,
  LayoutDashboard,
  Lock,
  Globe,
  Mail,
  Zap,
  Clock,
  Wrench,
  ChevronRight,
  Video,
} from "lucide-react";

type Audience = "Public" | "Admin" | "Token";

const MODULE_META: Record<
  string,
  { Icon: React.ElementType; audience: Audience; path: string }
> = {
  builders:     { Icon: Users,            audience: "Public", path: "/freelancers" },
  directory:    { Icon: Briefcase,        audience: "Public", path: "/directory" },
  showcase:     { Icon: Star,             audience: "Public", path: "/showcase" },
  gigs:         { Icon: Briefcase,        audience: "Admin",  path: "/admin/gigs" },
  loom:         { Icon: Video,            audience: "Admin",  path: "/admin/gigs/new" },
  apply:        { Icon: Globe,            audience: "Public", path: "/gigs/public/[slug]" },
  threads:      { Icon: MessageSquare,    audience: "Token",  path: "/gigs/thread/[token]" },
  availability: { Icon: Calendar,         audience: "Admin",  path: "/admin/availability" },
  tags:         { Icon: Tag,              audience: "Admin",  path: "/admin/tags" },
  dashboard:    { Icon: LayoutDashboard,  audience: "Admin",  path: "/admin" },
};

const GIG_TYPE_ICONS = { task: Zap, hourly: Clock, build: Wrench } as const;

export default async function DocsPage() {
  const t = await getTranslations("docs");
  const tGigs = await getTranslations("gigs");
  const moduleIds = Object.keys(MODULE_META) as (keyof typeof MODULE_META)[];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-3">{t("overview.header")}</h2>
        <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <p dangerouslySetInnerHTML={{ __html: t("overview.p1") }} />
          <p>{t("overview.p2")}</p>
          <p dangerouslySetInnerHTML={{ __html: t("overview.p3") }} />
        </div>
        <div className="flex gap-3 mt-4 flex-wrap">
          <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 font-medium">
            <Globe size={12} /> {t("overview.tagPublic")}
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
            <Lock size={12} /> {t("overview.tagAdmin")}
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 font-medium">
            <Mail size={12} /> {t("overview.tagToken")}
          </div>
        </div>
      </section>

      {/* Flow */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-3">{t("flow.header")}</h2>
        <p className="text-sm text-muted-foreground mb-5">{t("flow.subtitle")}</p>
        <div className="space-y-3">
          {([1, 2, 3, 4, 5] as const).map((n) => (
            <div
              key={n}
              className="flex gap-4 items-start border border-border rounded-md p-4 bg-card"
            >
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                {n}
              </div>
              <div>
                <div className="text-sm font-semibold">{t(`flow.step${n}Title`)}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{t(`flow.step${n}Desc`)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Module reference */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-5">{t("moduleHeader")}</h2>
        <div className="space-y-6">
          {moduleIds.map((id) => {
            const meta = MODULE_META[id];
            const features = t.raw(`modules.${id}.features`) as string[];
            return (
              <div key={id} id={id} className="border border-border rounded-lg bg-card">
                <div className="p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <meta.Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">{t(`modules.${id}.title`)}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          meta.audience === "Public"
                            ? "bg-green-500/10 text-green-600"
                            : meta.audience === "Admin"
                            ? "bg-primary/10 text-primary"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {t(`audience.${meta.audience}`)}
                      </span>
                    </div>
                    <Link
                      href={meta.path}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors mt-0.5 inline-flex items-center gap-0.5"
                      dir="ltr"
                    >
                      {meta.path} <ChevronRight size={10} />
                    </Link>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      {t(`modules.${id}.desc`)}
                    </p>
                  </div>
                </div>
                <div className="border-t border-border px-5 py-3">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    {t("featuresLabel")}
                  </div>
                  <ul className="space-y-1">
                    {features.map((f, i) => (
                      <li
                        key={i}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <span className="text-primary mt-1">•</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tech stack */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-3">{t("techHeader")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "Framework", value: "Next.js 15 (App Router)" },
            { label: "Auth",      value: "Clerk" },
            { label: "Database",  value: "PostgreSQL + Drizzle ORM" },
            { label: "Styling",   value: "Tailwind CSS 4 + shadcn/ui" },
            { label: "State",     value: "React Query (TanStack)" },
            { label: "Validation", value: "Zod + React Hook Form" },
            { label: "Hosting",   value: "Vercel / xhostd" },
            { label: "DB Host",   value: "Hostinger VPS (PostgreSQL 16)" },
          ].map((item) => (
            <div
              key={item.label}
              className="border border-border rounded-md px-4 py-3 bg-card flex items-center justify-between"
            >
              <span className="text-xs text-muted-foreground">{item.label}</span>
              <span className="text-sm font-medium" dir="ltr">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Gig types */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-3">{t("gigTypesHeader")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(["task", "hourly", "build"] as const).map((typeKey) => {
            const Icon = GIG_TYPE_ICONS[typeKey];
            return (
              <div key={typeKey} className="border border-border rounded-md p-4 bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} className="text-primary" />
                  <span className="text-sm font-semibold">
                    {tGigs(`type.${typeKey}`)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t(`gigTypes.${typeKey}`)}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
