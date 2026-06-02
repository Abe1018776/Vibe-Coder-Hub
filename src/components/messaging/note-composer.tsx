"use client";

import { useActionState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { sendMessage, type MessageState } from "@/lib/actions/conversations";

/** Composer for a private-reply thread — refined, auto-growing input. */
export function NoteComposer({ conversationId }: { conversationId: string }) {
  const action = sendMessage.bind(null, conversationId);
  const [state, formAction, pending] = useActionState<MessageState, FormData>(
    action,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!pending && !state.error) {
      formRef.current?.reset();
      if (taRef.current) {
        taRef.current.style.height = "auto";
        taRef.current.focus();
      }
    }
  }, [pending, state]);

  /** Grow the textarea with its content up to a comfortable max. */
  function autoGrow(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  /** Enter sends; Shift+Enter inserts a newline (familiar chat behaviour). */
  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!pending) formRef.current?.requestSubmit();
    }
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-1.5">
      <div className="flex items-end gap-2 rounded-2xl border border-border bg-canvas/60 p-1.5 pl-3.5 transition-colors focus-within:border-teal-600 focus-within:bg-surface focus-within:ring-2 focus-within:ring-teal-600/15">
        <textarea
          ref={taRef}
          name="body"
          rows={1}
          maxLength={4000}
          dir="auto"
          placeholder="Write a message…"
          onInput={(e) => autoGrow(e.currentTarget)}
          onKeyDown={onKeyDown}
          className="max-h-40 min-h-[28px] w-full resize-none self-center bg-transparent py-1.5 text-[14.5px] leading-relaxed text-ink outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary btn-sm shrink-0 !px-3 disabled:opacity-60"
          aria-label="Send message"
        >
          <Send size={16} />
          <span className="hidden sm:inline">{pending ? "Sending…" : "Send"}</span>
        </button>
      </div>
      {state.error ? (
        <p className="px-1 text-xs text-destructive">{state.error}</p>
      ) : (
        <p className="px-1 text-[11px] text-muted-foreground">
          <kbd className="font-sans font-semibold">Enter</kbd> to send ·{" "}
          <kbd className="font-sans font-semibold">Shift + Enter</kbd> for a new
          line
        </p>
      )}
    </form>
  );
}
