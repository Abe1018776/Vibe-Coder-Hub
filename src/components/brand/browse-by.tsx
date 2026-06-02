import Link from "next/link";

/** Centered "Browse by" label + one slow auto-scrolling row of all tags. */
export function BrowseBy({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  const loop = [...tags, ...tags];
  return (
    <div>
      <div className="mb-3 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-teal-800">
        Browse by
      </div>
      <div className="yv-marquee">
        <div className="yv-marquee-track">
          {loop.map((t, i) => (
            <Link
              key={`${t}-${i}`}
              href={`/showcase?tag=${encodeURIComponent(t)}`}
              className="yv-tag"
            >
              {t}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
