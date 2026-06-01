"use client";

import { useActionState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { sendMessage, type MessageState } from "@/lib/actions/conversations";

/** Composer for a private-reply thread. */
export function NoteComposer({ conversationId }: { conversationId: string }) {
  const action = sendMessage.bind(null, conversationId);
  const [state, formAction, pending] = useActionState<MessageState, FormData>(
    action,
    {},
  );
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) ref.current?.reset();
  }, [pending, state]);

  return (
    <form ref={ref} action={formAction} className="space-y-1.5">
      <div className="flex items-end gap-2">
        <textarea
          name="body"
          rows={1}
          maxLength={4000}
          placeholder="Write a note…"
          className="min-h-[44px] w-full resize-y rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
        />
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary btn-sm shrink-0 disabled:opacity-70"
          aria-label="Send"
        >
          <Send size={15} /> Send
        </button>
      </div>
      {state.error && <p className="text-xs text-clay-deep">{state.error}</p>}
    </form>
  );
}
