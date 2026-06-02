"use client";

import { useActionState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { sendMessage, type MessageState } from "@/lib/actions/gigs";

export function MessageComposer({
  threadId,
  slug,
}: {
  threadId: string;
  slug: string;
}) {
  const action = sendMessage.bind(null, threadId, slug);
  const [state, formAction, pending] = useActionState<MessageState, FormData>(
    action,
    {},
  );
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <div>
      <form ref={ref} action={formAction} className="flex items-end gap-2">
        <textarea
          name="body"
          rows={2}
          dir="auto"
          maxLength={4000}
          placeholder="Write a message…"
          className="flex-1 resize-none rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Send"
          className="btn btn-orange btn-sm disabled:opacity-70"
        >
          <Send size={15} /> Send
        </button>
      </form>
      {state.error && (
        <p className="mt-1 text-xs text-clay-deep">{state.error}</p>
      )}
    </div>
  );
}
