"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import type { GigMessage } from "@/lib/db";

export default function ThreadClient({
  token,
  gigTitle,
  gigSlug,
  freelancerName,
  initialMessages,
}: {
  token: string;
  gigTitle: string;
  gigSlug: string;
  freelancerName: string;
  initialMessages: GigMessage[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  async function send() {
    if (!draft.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/thread/${token}/messages`, {
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-5">
          <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
            Vibe Coder Hub
          </div>
          <h1 className="text-xl font-bold">{gigTitle}</h1>
          <p className="text-sm text-muted-foreground">
            Conversation as <strong>{freelancerName}</strong>
          </p>
        </div>

        <div className="space-y-3 mb-5">
          {initialMessages.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-6">
              No messages yet.
            </div>
          ) : (
            initialMessages.map((m) => (
              <div
                key={m.id}
                className={`border border-border rounded-md p-3 text-sm ${
                  m.senderType === "freelancer" ? "bg-primary/5" : "bg-card"
                }`}
              >
                <div className="text-xs text-muted-foreground mb-1">
                  {m.senderType === "freelancer" ? freelancerName : "Poster"} ·{" "}
                  {formatRelativeTime(m.createdAt)}
                </div>
                {m.content && <div className="whitespace-pre-wrap">{m.content}</div>}
              </div>
            ))
          )}
        </div>

        <div className="border border-border rounded-md bg-card p-3">
          <Textarea
            placeholder="Reply…"
            value={draft}
            rows={3}
            onChange={(e) => setDraft(e.target.value)}
            className="border-0 shadow-none focus-visible:ring-0"
          />
          <div className="flex justify-end mt-2">
            <Button size="sm" onClick={send} disabled={sending || !draft.trim()}>
              <Send size={13} /> {sending ? "Sending…" : "Send"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
