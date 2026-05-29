import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AmbientHero } from "@/components/brand/ambient-hero";

// NOTE: Phase 3 expands this with stat counters, two-door split, feature
// cards, and a live showcase strip. This is the hero foundation.
export default function Home() {
  return (
    <AmbientHero className="px-4">
      <div className="mx-auto flex max-w-[1120px] flex-col items-center py-24 text-center md:py-32">
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
      </div>
    </AmbientHero>
  );
}
