import Link from "next/link";
import { AvatarCircle } from "@/components/brand/avatar-circle";
import { ReportMenu } from "@/components/brand/report-menu";
import { AddCommentForm } from "./add-comment-form";
import { deleteComment } from "@/lib/actions/comments";
import { displayName } from "@/lib/display";
import { formatRelativeTime } from "@/lib/utils";

export type CommentRow = {
  id: string;
  author_id: string;
  is_anonymous: boolean;
  body: string;
  created_at: string;
  author: {
    handle: string;
    name: string;
    avatar_url: string | null;
    show_real_name?: boolean | null;
  } | null;
};

/**
 * Fixed-height, internally scrollable comments card for the project rail. Header
 * + scrolling list + a pinned composer at the bottom.
 */
export function CommentsCard({
  projectId,
  comments,
  meId,
  isAuthed,
}: {
  projectId: string;
  comments: CommentRow[];
  meId: string | null;
  isAuthed: boolean;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-sm)]">
      <div className="border-b border-border px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
          Comments{comments.length > 0 && ` · ${comments.length}`}
        </p>
      </div>

      <ul className="max-h-[340px] flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {comments.length === 0 ? (
          <li className="text-sm text-muted-foreground">
            No comments yet — be the first to cheer this on.
          </li>
        ) : (
          comments.map((c) => {
            const del = deleteComment.bind(null, c.id, projectId);
            const mine = meId === c.author_id;
            return (
              <li key={c.id} className="flex gap-3">
                <AvatarCircle
                  name={
                    c.is_anonymous
                      ? "?"
                      : c.author
                        ? displayName(c.author)
                        : "?"
                  }
                  src={c.is_anonymous ? null : c.author?.avatar_url}
                  size={30}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {c.is_anonymous ? (
                      <span className="text-sm font-semibold text-ink">
                        Anonymous
                      </span>
                    ) : c.author ? (
                      <Link
                        href={`/u/${c.author.handle}`}
                        className="text-sm font-semibold text-ink hover:underline"
                      >
                        {displayName(c.author)}
                      </Link>
                    ) : (
                      <span className="text-sm font-semibold text-ink">Someone</span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(c.created_at)}
                    </span>
                    {mine ? (
                      <form action={del} className="ml-auto">
                        <button
                          type="submit"
                          className="text-xs text-muted-foreground transition-colors hover:text-clay-deep"
                        >
                          Delete
                        </button>
                      </form>
                    ) : (
                      isAuthed && (
                        <div className="ml-auto">
                          <ReportMenu targetType="comment" targetId={c.id} />
                        </div>
                      )
                    )}
                  </div>
                  <p
                    className="mt-1 whitespace-pre-line text-sm text-ink/90"
                    dir="auto"
                  >
                    {c.body}
                  </p>
                </div>
              </li>
            );
          })
        )}
      </ul>

      <div className="border-t border-border px-4 py-3">
        {isAuthed ? (
          <AddCommentForm projectId={projectId} />
        ) : (
          <Link
            href={`/login?next=/showcase/${projectId}`}
            className="btn btn-ghost btn-sm"
          >
            Sign in to comment
          </Link>
        )}
      </div>
    </div>
  );
}
