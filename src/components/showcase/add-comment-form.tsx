"use client";

import { useActionState, useEffect, useRef } from "react";
import { addComment, type CommentFormState } from "@/lib/actions/comments";

export function AddCommentForm({ projectId }: { projectId: string }) {
  const action = addComment.bind(null, projectId);
  const [state, formAction, pending] = useActionState<
    CommentFormState,
    FormData
  >(action, {});
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={formAction}>
      <textarea
        name="body"
        rows={3}
        dir="auto"
        maxLength={2000}
        placeholder="Add a comment…"
        className="w-full resize-y rounded-[10px] border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
      />
      {state.error && (
        <p className="mt-1 text-xs text-clay-deep">{state.error}</p>
      )}
      <div className="mt-2 flex items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            name="is_anonymous"
            className="h-3.5 w-3.5 rounded border-border accent-teal-600"
          />
          Post anonymously
        </label>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 items-center rounded-[10px] bg-teal-600 px-4 text-sm font-medium text-white transition-transform active:scale-[0.98] disabled:opacity-70"
        >
          {pending ? "Posting…" : "Comment"}
        </button>
      </div>
    </form>
  );
}
