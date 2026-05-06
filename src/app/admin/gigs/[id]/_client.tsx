"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, ExternalLink, Send, Share2 } from "lucide-react";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/utils";
import type { Gig, GigConversation, GigMessage } from "@/lib/db";

type ConvWithMessages = GigConversation & { messages: GigMessage[] };

export default function GigDetailClient({
  gig,
  conversations,
}: {
  gig: Gig;
  conversations: ConvWithMessages[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState(gig.status);
  const [active, setActive] = useState<number | null>(
    conversations[0]?.id ?? null,
  );
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const activeConv = conversations.find((c) => c.id === active);

  async function changeStatus(newStatus: typeof gig.status) {
    setStatus(newStatus);
    try {
      const res = await fetch(`/api/gigs/${gig.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success("Status updated");
      router.refresh();
    } catch {
      toast.error("Failed to update");
      setStatus(gig.status);
    }
  }

  async function reply() {
    if (!draft.trim() || !active) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${active}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: draft }),
      });
      if (!res.ok) throw new Error();
      setDraft("");
      router.refresh();
    } catch {
      toast.error("Failed to send");
    } finally {
      setSending(false);
    }
  }

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/gigs/public/${gig.publicSlug}`
      : "";

  function shareWhatsapp() {
    const msg = encodeURIComponent(
      `Vibe Coder gig: ${gig.title}\nApply here: ${publicUrl}`,
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-5">
        <Link href="/admin/gigs">
          <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">
            ← Gig Board
          </span>
        </Link>
      </div>

      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">{gig.title}</h1>
          <div className="text-xs text-muted-foreground mt-1 capitalize">
            {gig.type} · {formatRelativeTime(gig.createdAt)}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={status} onValueChange={(v) => changeStatus(v as typeof status)}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(publicUrl);
              toast.success("Public link copied");
            }}
          >
            <Copy size={13} /> Copy link
          </Button>
          <Button variant="outline" size="sm" onClick={shareWhatsapp}>
            <Share2 size={13} /> WhatsApp
          </Button>
        </div>
      </div>

      <div className="border border-border rounded-md bg-card p-4 mb-6">
        <p className="text-sm">{gig.description}</p>
        {gig.requirements && (
          <p className="text-xs text-muted-foreground mt-3 border-l-2 border-primary/30 pl-2">
            {gig.requirements}
          </p>
        )}
        {gig.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {gig.tags.map((t) => (
              <span
                key={t}
                className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="mt-3 text-xs text-muted-foreground flex gap-4">
          {gig.budgetMin && (
            <span>
              Budget: ${gig.budgetMin}
              {gig.budgetMax ? `–$${gig.budgetMax}` : ""}
            </span>
          )}
          {gig.hourlyRate && <span>Rate: ${gig.hourlyRate}/hr</span>}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <a href={publicUrl} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm">
              <ExternalLink size={13} /> View public page
            </Button>
          </a>
        </div>
      </div>

      <div className="grid md:grid-cols-[280px_1fr] gap-4">
        <div className="border border-border rounded-md bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">
              Applicants ({conversations.length})
            </h2>
          </div>
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No applicants yet. Share the public link above.
            </div>
          ) : (
            <ul>
              {conversations.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setActive(c.id)}
                    className={`w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-muted/40 ${
                      active === c.id ? "bg-muted/60" : ""
                    }`}
                  >
                    <div className="text-sm font-medium truncate">
                      {c.freelancerName}
                    </div>
                    {c.freelancerEmail && (
                      <div className="text-xs text-muted-foreground truncate">
                        {c.freelancerEmail}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {formatRelativeTime(c.createdAt)} ·{" "}
                      {c.messages.length} message
                      {c.messages.length !== 1 ? "s" : ""}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border border-border rounded-md bg-card flex flex-col min-h-[400px]">
          {!activeConv ? (
            <div className="p-10 text-center text-sm text-muted-foreground m-auto">
              Pick an applicant on the left.
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-border">
                <h2 className="text-sm font-semibold">
                  Conversation with {activeConv.freelancerName}
                </h2>
              </div>
              <div className="p-4 space-y-3 flex-1 overflow-auto">
                {activeConv.messages.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-6">
                    No messages yet.
                  </div>
                ) : (
                  activeConv.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`border border-border rounded-md p-3 text-sm ${
                        m.senderType === "freelancer" ? "bg-primary/5" : "bg-card"
                      }`}
                    >
                      <div className="text-xs text-muted-foreground mb-1">
                        {m.senderType === "freelancer"
                          ? activeConv.freelancerName
                          : "You"}{" "}
                        · {formatRelativeTime(m.createdAt)}
                      </div>
                      {m.content && (
                        <div className="whitespace-pre-wrap">{m.content}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-border p-3">
                <Textarea
                  placeholder="Reply…"
                  value={draft}
                  rows={2}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <div className="flex justify-end mt-2">
                  <Button
                    size="sm"
                    onClick={reply}
                    disabled={sending || !draft.trim()}
                  >
                    <Send size={13} /> {sending ? "Sending…" : "Send"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
