import { MessageCircle } from "lucide-react";
import { startConversation } from "@/lib/actions/conversations";
import { cn } from "@/lib/utils";

/**
 * "Send a private note" — a form that opens (or reuses) a conversation and jumps
 * to the thread. Render this only when the viewer is allowed to message the
 * target; otherwise show the blocked message yourself.
 */
export function NoteButton({
  otherId,
  about,
  label = "Send a private note",
  className,
}: {
  otherId: string;
  about?: { type: string; id: string };
  label?: string;
  className?: string;
}) {
  const action = startConversation.bind(null, otherId, about);
  return (
    <form action={action} className="contents">
      <button
        type="submit"
        className={cn("btn btn-sm", className ?? "btn-ghost")}
      >
        <MessageCircle size={15} /> {label}
      </button>
    </form>
  );
}
