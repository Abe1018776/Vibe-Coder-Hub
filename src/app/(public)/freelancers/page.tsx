import Link from "next/link";
import { db, freelancersTable } from "@/lib/db";
import { desc, ilike, or, sql, eq } from "drizzle-orm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import FreelancerSearch from "./_search";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string; tag?: string }>;
}

export default async function FreelancersPage({ searchParams }: Props) {
  const { q, tag } = await searchParams;
  const t = await getTranslations("freelancers");

  const conditions = [] as ReturnType<typeof eq>[];
  if (q) {
    conditions.push(
      or(
        ilike(freelancersTable.name, `%${q}%`),
        ilike(freelancersTable.bio, `%${q}%`),
      )!,
    );
  }
  if (tag) {
    conditions.push(sql`${tag} = ANY(${freelancersTable.tags})`);
  }

  const freelancers = await db
    .select()
    .from(freelancersTable)
    .where(conditions.length ? sql`${sql.join(conditions, sql` AND `)}` : undefined)
    .orderBy(desc(freelancersTable.createdAt));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("builderCount", { count: freelancers.length })}
          </p>
        </div>
        <Link href="/admin/freelancers/new">
          <Button size="sm">
            <Plus size={14} /> {t("addBuilder")}
          </Button>
        </Link>
      </div>

      <FreelancerSearch initialQ={q ?? ""} initialTag={tag ?? ""} />

      {freelancers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-5">
          {freelancers.map((f) => (
            <Link key={f.id} href={`/freelancers/${f.id}`}>
              <div className="border border-border rounded-md bg-card p-4 hover:border-primary/50 transition-colors cursor-pointer h-full">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {f.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{f.name}</div>
                    {f.hourlyRate && (
                      <div className="text-xs text-muted-foreground">${f.hourlyRate}/hr</div>
                    )}
                    {f.bio && (
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{f.bio}</div>
                    )}
                    {f.tools.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {f.tools.slice(0, 4).map((t) => (
                          <span
                            key={t}
                            className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                          >
                            {t}
                          </span>
                        ))}
                        {f.tools.length > 4 && (
                          <span className="text-xs text-muted-foreground">
                            +{f.tools.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-sm text-muted-foreground mt-5">
          {t("empty")}{" "}
          <Link href="/admin/freelancers/new">
            <span className="text-primary underline cursor-pointer">{t("addFirst")}</span>
          </Link>
        </div>
      )}
    </div>
  );
}
