import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Play, MessageSquare, ArrowRight } from "lucide-react";
import {
  getGigBySlug,
  getThreadsForGig,
  getMyThreadForGig,
  GIG_TYPE_LABEL,
  gigBudgetLabel,
} from "@/lib/gigs";
import { getCurrentProfile } from "@/lib/current-user";
import { AvatarCircle } from "@/components/brand/avatar-circle";
import { Pill, TagPill } from "@/components/brand/pill";
import { applyToGig, setGigStatus } from "@/lib/actions/gigs";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const gig = await getGigBySlug(slug);
  if (!gig) return { title: "Gig not found" };
  return { title: gig.title, description: gig.description.slice(0, 155) };
}

const STATUSES = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "closed", label: "Closed" },
] as const;

export default async function GigDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const gig = await getGigBySlug(slug);
  if (!gig) notFound();

  const me = await getCurrentProfile();
  const isPoster = me?.id === gig.poster_id;
  const budget = gigBudgetLabel(gig);

  const threads = isPoster ? await getThreadsForGig(gig.id) : [];
  const myThread =
    me && !isPoster ? await getMyThreadForGig(gig.id, me.id) : null;
  const apply = applyToGig.bind(null, gig.id, slug);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <div className="flex items-center gap-2">
        <Pill accent="orange">{GIG_TYPE_LABEL[gig.type]}</Pill>
        {gig.status !== "open" && (
          <Pill accent="neutral">
            {gig.status === "in_progress" ? "In progress" : "Closed"}
          </Pill>
        )}
      </div>

      <h1 className="mt-3 font-display text-[clamp(1.8rem,4vw,2.5rem)] font-bold tracking-tight text-ink" dir="auto">
        {gig.title}
      </h1>
      {budget && <p className="mt-2 text-lg font-medium text-ink">{budget}</p>}

      <p
        className="mt-5 whitespace-pre-line text-[15px] leading-relaxed text-ink/90"
        dir="auto"
      >
        {gig.description}
      </p>

      {gig.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {gig.tags.map((t) => (
            <TagPill key={t}>{t}</TagPill>
          ))}
        </div>
      )}

      {gig.loom_url && (
        <a
          href={gig.loom_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-sm mt-4"
        >
          <Play size={15} /> Watch the brief
        </a>
      )}

      {gig.poster && (
        <div className="mt-6 flex items-center gap-3 rounded-card border border-border bg-surface p-4">
          <AvatarCircle
            name={gig.poster.name}
            src={gig.poster.avatar_url}
            size={40}
            accent="orange"
          />
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Posted by
            </p>
            <Link
              href={`/u/${gig.poster.handle}`}
              className="font-medium text-ink hover:underline"
            >
              {gig.poster.name}
            </Link>
          </div>
        </div>
      )}

      <div className="mt-8">
        {isPoster ? (
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              {STATUSES.map((s) => {
                const set = setGigStatus.bind(null, gig.id, slug, s.value);
                const active = gig.status === s.value;
                return (
                  <form key={s.value} action={set}>
                    <button
                      type="submit"
                      className={cn(
                        "rounded-full px-3 py-1 text-xs transition-colors",
                        active
                          ? "bg-teal-600 text-white"
                          : "border border-border text-muted-foreground hover:bg-secondary",
                      )}
                    >
                      {s.label}
                    </button>
                  </form>
                );
              })}
            </div>

            <h2 className="mt-7 font-display text-xl font-bold text-ink">
              Applicants{threads.length > 0 ? ` (${threads.length})` : ""}
            </h2>
            {threads.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                No applicants yet.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {threads.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/gigs/${slug}/thread/${t.id}`}
                      className="flex items-center gap-3 rounded-card border border-border bg-surface p-3 transition-colors hover:border-border-hover"
                    >
                      <AvatarCircle
                        name={t.applicant?.name ?? "?"}
                        src={t.applicant?.avatar_url}
                        size={32}
                      />
                      <span className="text-sm text-ink">
                        {t.applicant?.name ?? "Applicant"}
                      </span>
                      <ArrowRight
                        size={15}
                        className="ml-auto text-muted-foreground"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : myThread ? (
          <Link
            href={`/gigs/${slug}/thread/${myThread.id}`}
            className="btn btn-orange"
          >
            <MessageSquare size={16} /> View your conversation
          </Link>
        ) : gig.status === "open" ? (
          me ? (
            <form action={apply}>
              <button type="submit" className="btn btn-orange">
                Apply to this gig
              </button>
            </form>
          ) : (
            <Link href={`/login?next=/gigs/${slug}`} className="btn btn-orange">
              Sign in to apply
            </Link>
          )
        ) : (
          <p className="text-sm text-muted-foreground">
            This gig is no longer accepting applicants.
          </p>
        )}
      </div>
    </div>
  );
}
