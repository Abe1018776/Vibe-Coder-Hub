import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Trophy, ExternalLink, Play } from "lucide-react";
import {
  getCompetitionBySlug,
  getSubmissions,
  deadlineLabel,
} from "@/lib/competitions";
import { getCurrentProfile } from "@/lib/current-user";
import { getAdminContext } from "@/lib/admin";
import { pickWinner } from "@/lib/actions/competitions";
import { AvatarCircle } from "@/components/brand/avatar-circle";
import { Pill } from "@/components/brand/pill";
import { DetailHero } from "@/components/brand/detail-hero";
import { SubmitEntryForm } from "@/components/competitions/submit-entry-form";
import { formatRelativeTime, cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const comp = await getCompetitionBySlug(slug);
  if (!comp) return { title: "Competition not found" };
  return { title: comp.title, description: comp.description.slice(0, 155) };
}

export default async function CompetitionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const comp = await getCompetitionBySlug(slug);
  if (!comp) notFound();

  const [submissions, me, admin] = await Promise.all([
    getSubmissions(comp.id),
    getCurrentProfile(),
    getAdminContext(),
  ]);
  const dl = deadlineLabel(comp.deadline);
  const isCreator = me?.id === comp.creator_id;
  // Pending competitions are visible only to their creator and admins.
  if (comp.review_status !== "approved" && !isCreator && !admin) notFound();
  const winnerId = comp.winner_submission_id;
  const canSubmit = !!me && !isCreator && !dl.ended && comp.status === "open";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <div className="mt-5">
        <DetailHero
          accent="gold"
          title={comp.title}
          watermarkIcon={<Trophy strokeWidth={1.5} />}
          badge={
            <span className="inline-flex items-center gap-1.5">
              <Trophy size={14} /> ${comp.prize_amount.toLocaleString()} ·{" "}
              {winnerId ? "Winner picked" : dl.text}
            </span>
          }
          tags={comp.tags.map((t) => ({ label: t }))}
        />
      </div>

      {comp.review_status !== "approved" && (
        <div className="mt-4 rounded-2xl border border-gold-300 bg-gold-50 px-4 py-3 text-sm text-gold-700">
          {comp.review_status === "rejected"
            ? "This competition wasn't approved. Only you and admins can see it."
            : "Pending review — only you and admins can see this until an admin approves it."}
        </div>
      )}

      <p className="mt-3 text-sm text-muted-foreground">
        Deadline: {new Date(comp.deadline).toLocaleString()}
      </p>

      <p
        className="mt-5 whitespace-pre-line text-[15px] leading-relaxed text-ink/90"
        dir="auto"
      >
        {comp.description}
      </p>

      {comp.loom_url && (
        <a
          href={comp.loom_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-sm mt-4"
        >
          <Play size={15} /> Watch the brief
        </a>
      )}

      {comp.creator && (
        <div className="mt-6 flex items-center gap-3 rounded-card border border-border bg-surface p-4">
          <AvatarCircle
            name={comp.creator.name}
            src={comp.creator.avatar_url}
            size={40}
            accent="clay"
          />
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Hosted by
            </p>
            <Link
              href={`/u/${comp.creator.handle}`}
              className="font-medium text-ink hover:underline"
            >
              {comp.creator.name}
            </Link>
          </div>
        </div>
      )}

      <section className="mt-8">
        {canSubmit ? (
          <div className="rounded-card border border-border bg-surface p-5">
            <h2 className="font-display text-lg font-bold text-ink">Submit your entry</h2>
            <div className="mt-3">
              <SubmitEntryForm competitionId={comp.id} slug={slug} />
            </div>
          </div>
        ) : isCreator ? (
          <p className="text-sm text-muted-foreground">
            You&apos;re hosting this competition.
          </p>
        ) : !me ? (
          <Link
            href={`/login?next=/competitions/${slug}`}
            className="btn btn-gold"
          >
            Sign in to submit an entry
          </Link>
        ) : (
          <p className="text-sm text-muted-foreground">
            This competition is no longer accepting entries.
          </p>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-ink">
          Entries{submissions.length > 0 ? ` (${submissions.length})` : ""}
        </h2>
        {submissions.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No entries yet — be the first.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {submissions.map((s) => {
              const isWinner = s.id === winnerId;
              const pick = pickWinner.bind(null, comp.id, slug, s.id);
              return (
                <li
                  key={s.id}
                  className={cn(
                    "rounded-card border p-4",
                    isWinner
                      ? "border-gold-mid bg-gold-tint/50"
                      : "border-border bg-surface",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <AvatarCircle
                      name={s.submitter?.name ?? "?"}
                      src={s.submitter?.avatar_url}
                      size={28}
                      accent="clay"
                    />
                    {s.submitter ? (
                      <Link
                        href={`/u/${s.submitter.handle}`}
                        className="text-sm font-medium text-ink hover:underline"
                      >
                        {s.submitter.name}
                      </Link>
                    ) : (
                      <span className="text-sm font-medium text-ink">
                        Someone
                      </span>
                    )}
                    {isWinner && <Pill accent="gold">Winner</Pill>}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {formatRelativeTime(s.created_at)}
                    </span>
                  </div>

                  {s.description && (
                    <p
                      className="mt-2 whitespace-pre-line text-sm text-ink/90"
                      dir="auto"
                    >
                      {s.description}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={s.submission_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 items-center gap-1.5 rounded-[10px] border border-border bg-surface px-3 text-xs text-ink transition-colors hover:bg-secondary"
                    >
                      <ExternalLink size={13} /> View entry
                    </a>
                    {s.loom_url && (
                      <a
                        href={s.loom_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 items-center gap-1.5 rounded-[10px] border border-border bg-surface px-3 text-xs text-ink transition-colors hover:bg-secondary"
                      >
                        <Play size={13} /> Demo
                      </a>
                    )}
                    {isCreator && !winnerId && comp.status !== "closed" && (
                      <form action={pick}>
                        <button
                          type="submit"
                          className="inline-flex h-8 items-center gap-1.5 rounded-[10px] bg-gold-deep px-3 text-xs font-medium text-white transition-transform active:scale-[0.98]"
                        >
                          <Trophy size={13} /> Pick as winner
                        </button>
                      </form>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
