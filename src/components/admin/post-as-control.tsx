"use client";

import { useState } from "react";
import { BadgeCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type PickableUser = {
  id: string;
  name: string;
  handle: string;
};

/**
 * Segmented "Official YidVibe / A user" picker. Writes a hidden `post_as` field
 * read by adminPostContent: "official" or the chosen user's id.
 */
export function PostAsControl({ users }: { users: PickableUser[] }) {
  const [mode, setMode] = useState<"official" | "user">("official");
  const [userId, setUserId] = useState(users[0]?.id ?? "");

  const postAs = mode === "official" ? "official" : userId;

  return (
    <div>
      <input type="hidden" name="post_as" value={postAs} />
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMode("official")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-card border px-4 py-3 text-sm font-medium transition-colors",
            mode === "official"
              ? "border-teal-600 bg-teal-50 text-teal-800"
              : "border-border bg-surface text-ink hover:border-border-hover",
          )}
        >
          <BadgeCheck size={16} /> Official YidVibe
        </button>
        <button
          type="button"
          onClick={() => setMode("user")}
          disabled={users.length === 0}
          className={cn(
            "flex items-center justify-center gap-2 rounded-card border px-4 py-3 text-sm font-medium transition-colors disabled:opacity-50",
            mode === "user"
              ? "border-teal-600 bg-teal-50 text-teal-800"
              : "border-border bg-surface text-ink hover:border-border-hover",
          )}
        >
          <User size={16} /> A user
        </button>
      </div>

      {mode === "user" && (
        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          aria-label="Post on behalf of"
          className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none transition-colors focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} (@{u.handle})
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
