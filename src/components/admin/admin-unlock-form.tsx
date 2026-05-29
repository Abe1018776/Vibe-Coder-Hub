"use client";

import { useActionState } from "react";
import { unlockAdmin, type UnlockState } from "@/lib/actions/admin";

export function AdminUnlockForm() {
  const [state, action, pending] = useActionState<UnlockState, FormData>(
    unlockAdmin,
    {},
  );
  return (
    <form action={action} className="mt-6 space-y-3">
      <input
        type="password"
        name="passcode"
        autoComplete="off"
        required
        placeholder="Admin passcode"
        className="h-11 w-full rounded-[10px] border border-border bg-surface px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-ring"
      />
      {state.error && (
        <p className="rounded-lg bg-clay-tint px-3 py-2 text-sm text-clay-deep">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center rounded-[10px] bg-teal-600 px-4 text-[15px] font-medium text-white transition-transform active:scale-[0.99] disabled:opacity-70"
      >
        {pending ? "Unlocking…" : "Unlock admin"}
      </button>
    </form>
  );
}
