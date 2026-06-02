import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Accent } from "@/lib/site";

const FG: Record<Accent, string> = {
  teal: "var(--teal-700)", gold: "var(--gold-700)", sage: "var(--sage-deep)",
  clay: "var(--clay-deep)", blue: "var(--blue-deep)", orange: "var(--orange-deep)",
};

/** Slim branded breadcrumb for inner/detail pages: ‹ Section / Name */
export function SectionCrumb({
  section, href, name, accent = "teal",
}: { section: string; href: string; name?: string; accent?: Accent }) {
  return (
    <div className="mb-5 flex items-center gap-2 border-b border-border pb-3 text-[13px]">
      <Link href={href} className="inline-flex items-center gap-1.5 font-bold" style={{ color: FG[accent] }}>
        <ChevronLeft size={14} /> {section}
      </Link>
      {name && (<><span className="text-border">/</span><span className="truncate text-muted-foreground">{name}</span></>)}
    </div>
  );
}
