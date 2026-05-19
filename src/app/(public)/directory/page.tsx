import Link from "next/link";
import { db, professionalsTable } from "@/lib/db";
import { desc, ilike, or, sql, eq } from "drizzle-orm";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Briefcase, ExternalLink } from "lucide-react";
import DirectorySearch from "./_search";
import DirectorySubmit from "./_submit";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string; tag?: string }>;
}

export default async function DirectoryPage({ searchParams }: Props) {
  const { q, tag } = await searchParams;

  const conditions = [] as ReturnType<typeof eq>[];
  if (q) {
    conditions.push(
      or(
        ilike(professionalsTable.name, `%${q}%`),
        ilike(professionalsTable.title, `%${q}%`),
        ilike(professionalsTable.company, `%${q}%`),
        ilike(professionalsTable.bio, `%${q}%`),
      )!,
    );
  }
  if (tag) {
    conditions.push(sql`${tag} = ANY(${professionalsTable.tags})`);
  }

  const professionals = await db
    .select()
    .from(professionalsTable)
    .where(conditions.length ? sql`${sql.join(conditions, sql` AND `)}` : undefined)
    .orderBy(desc(professionalsTable.createdAt));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Jewish AI Professionals</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {professionals.length} professional{professionals.length !== 1 ? "s" : ""}
          </p>
        </div>
        <DirectorySubmit />
      </div>

      <DirectorySearch initialQ={q ?? ""} initialTag={tag ?? ""} />

      {professionals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-5">
          {professionals.map((p) => (
            <div
              key={p.id}
              className="border border-border rounded-md bg-card p-4 hover:border-primary/50 transition-colors h-full"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{p.name}</div>
                  <div className="text-xs text-primary font-medium">{p.title}</div>
                  {p.company && (
                    <div className="text-xs text-muted-foreground">{p.company}</div>
                  )}
                  {p.location && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin size={10} /> {p.location}
                    </div>
                  )}
                  {p.bio && (
                    <div className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                      {p.bio}
                    </div>
                  )}
                  {p.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.expertise.slice(0, 4).map((e) => (
                        <span
                          key={e}
                          className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                        >
                          {e}
                        </span>
                      ))}
                      {p.expertise.length > 4 && (
                        <span className="text-xs text-muted-foreground">
                          +{p.expertise.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {p.linkedIn && (
                      <a
                        href={p.linkedIn}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                    {p.website && (
                      <a
                        href={p.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Briefcase size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-sm text-muted-foreground mt-5">
          No professionals found.
        </div>
      )}
    </div>
  );
}
