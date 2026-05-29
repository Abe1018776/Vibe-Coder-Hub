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
          className="flex-1 resize-none rounded-[10px] border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Send"
          className="inline-flex h-10 items-center gap-1.5 rounded-[10px] bg-orange-mid px-4 text-sm font-medium text-white transition-transform active:scale-[0.98] disabled:opacity-70"
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
