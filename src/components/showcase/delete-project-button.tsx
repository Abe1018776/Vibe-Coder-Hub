"use client";

import { Trash2 } from "lucide-react";

export function DeleteProjectButton({
  action,
}: {
  action: () => Promise<void>;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm("Delete this project? This can't be undone.")) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-border bg-surface px-3 text-sm text-clay-deep transition-colors hover:bg-clay-tint"
      >
        <Trash2 size={15} /> Delete
      </button>
    </form>
  );
}
