import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getGigBySlug, getThread, getMessages } from "@/lib/gigs";
import { getCurrentProfile } from "@/lib/current-user";
import { AvatarCircle } from "@/components/brand/avatar-circle";
import { MessageComposer } from "@/components/gigs/message-composer";
import { formatRelativeTime, cn } from "@/lib/utils";

export const metadata = { title: "Conversation" };

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ slug: string; threadId: string }>;
}) {
  const { slug, threadId } = await params;
  const me = await getCurrentProfile();
  if (!me) redirect(`/login?next=/gigs/${slug}/thread/${threadId}`);

  const [gig, thread] = await Promise.all([
    getGigBySlug(slug),
    getThread(threadId),
  ]);
  // RLS returns no thread for non-participants → treat as not found.
  if (!gig || !thread || thread.gig_id !== gig.id) notFound();

  const messages = await getMessages(threadId);
  const isPoster = me.id === gig.poster_id;
  const other = isPoster
    ? thread.applicant
    : gig.poster;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col px-4 py-8 md:px-6">
      <Link
        href={`/gigs/${slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-ink"
      >
        <ArrowLeft size={15} /> Back to gig
      </Link>

      <div className="mt-4 flex items-center gap-3 border-b border-border pb-4">
        <AvatarCircle
          name={other?.name ?? "?"}
          src={other?.avatar_url}
          size={40}
          accent="orange"
        />
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">
            {other?.name ?? "Conversation"}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            About: {gig.title}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-3 py-6">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {isPoster
              ? "Say hello to your applicant."
              : "Introduce yourself and share why you're a fit."}
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === me.id;
            return (
              <div
                key={m.id}
                className={cn("flex", mine ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-card px-3.5 py-2",
                    mine
                      ? "bg-teal-600 text-white"
                      : "border border-border bg-surface text-ink",
                  )}
                >
                  <p
                    className="whitespace-pre-line text-sm leading-relaxed"
                    dir="auto"
                  >
                    {m.body}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-[11px]",
                      mine ? "text-white/70" : "text-muted-foreground",
                    )}
                  >
                    {formatRelativeTime(m.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="sticky bottom-0 border-t border-border bg-canvas py-3">
        <MessageComposer threadId={threadId} slug={slug} />
      </div>
    </div>
  );
}
