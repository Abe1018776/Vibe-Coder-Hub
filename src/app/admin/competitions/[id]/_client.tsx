"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Copy,
  ExternalLink,
  Share2,
  Trash2,
  Trophy,
  Crown,
  Calendar,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/utils";
import type { Competition, CompetitionSubmission } from "@/lib/db";

function loomEmbedUrl(url: string) {
  const match = url.match(/loom\.com\/(?:share|embed)\/([a-f0-9]+)/);
  if (!match) return null;
  return `https://www.loom.com/embed/${match[1]}`;
}

export default function CompetitionManageClient({
  competition,
  submissions,
}: {
  competition: Competition;
  submissions: CompetitionSubmission[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState(competition.status);
  const [winnerId, setWinnerId] = useState(competition.winnerSubmissionId);
  const [picking, setPicking] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function changeStatus(newStatus: typeof competition.status) {
    setStatus(newStatus);
    try {
      const res = await fetch(`/api/competitions/${competition.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success("Status updated");
      router.refresh();
    } catch {
      toast.error("Failed to update");
      setStatus(competition.status);
    }
  }

  async function pickWinner(submissionId: number | null) {
    setPicking(submissionId ?? -1);
    try {
      const res = await fetch(`/api/competitions/${competition.id}/pick-winner`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ submissionId }),
      });
      if (!res.ok) throw new Error();
      setWinnerId(submissionId);
      if (submissionId !== null) setStatus("closed");
      toast.success(submissionId ? "Winner picked" : "Winner cleared");
      router.refresh();
    } catch {
      toast.error("Failed to pick winner");
    } finally {
      setPicking(null);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this competition and all submissions?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/competitions/${competition.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Competition deleted");
      router.push("/admin/competitions");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/competitions/public/${competition.publicSlug}`
      : "";

  function shareWhatsapp() {
    const msg = encodeURIComponent(
      `Competition: ${competition.title}\nPrize: $${competition.prizeAmount}\nSubmit here: ${publicUrl}`,
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }

  const embed = competition.loomUrl ? loomEmbedUrl(competition.loomUrl) : null;
  const deadlineDate = new Date(competition.deadline);
  const deadlinePassed = deadlineDate.getTime() < Date.now();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-5">
        <Link href="/admin/competitions">
          <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">
            ← Competitions
          </span>
        </Link>
      </div>

      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" />
            {competition.title}
          </h1>
          <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-3">
            <span className="flex items-center gap-1">
              <DollarSign size={11} />${competition.prizeAmount.toLocaleString()}
            </span>
            <span
              className={`flex items-center gap-1 ${deadlinePassed ? "text-destructive" : ""}`}
            >
              <Calendar size={11} />
              {deadlineDate.toLocaleString()}
              {deadlinePassed ? " (passed)" : ""}
            </span>
            <span>{formatRelativeTime(competition.createdAt)}</span>
          </div>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <Select value={status} onValueChange={(v) => changeStatus(v as typeof status)}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="judging">Judging</SelectItem>
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 size={13} />
          </Button>
        </div>
      </div>

      <div className="border border-border rounded-md bg-card p-4 mb-6">
        <p className="text-sm whitespace-pre-wrap">{competition.description}</p>
        {competition.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {competition.tags.map((t) => (
              <span
                key={t}
                className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {embed && (
          <div className="mt-4">
            <div className="text-xs font-semibold text-muted-foreground mb-2">
              Video walkthrough
            </div>
            <iframe
              src={embed}
              allowFullScreen
              className="w-full aspect-video rounded-md border border-border"
            />
          </div>
        )}

        {competition.referenceUrls.length > 0 && (
          <div className="mt-4">
            <div className="text-xs font-semibold text-muted-foreground mb-2">
              Reference materials
            </div>
            <ul className="space-y-1">
              {competition.referenceUrls.map((u) => (
                <li key={u}>
                  <a
                    href={u}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary hover:underline break-all"
                  >
                    {u}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4">
          <a href={publicUrl} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm">
              <ExternalLink size={13} /> View public page
            </Button>
          </a>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">
          Submissions ({submissions.length})
        </h2>
        {winnerId && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => pickWinner(null)}
            disabled={picking !== null}
          >
            Clear winner
          </Button>
        )}
      </div>

      {submissions.length === 0 ? (
        <div className="border border-border rounded-md bg-card p-10 text-center text-sm text-muted-foreground">
          No submissions yet. Share the public link to invite people.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {submissions.map((s) => {
            const isWinner = s.id === winnerId;
            const subEmbed = s.loomUrl ? loomEmbedUrl(s.loomUrl) : null;
            return (
              <div
                key={s.id}
                className={`border rounded-md bg-card overflow-hidden ${
                  isWinner ? "border-amber-500 ring-2 ring-amber-400/40" : "border-border"
                }`}
              >
                {isWinner && (
                  <div className="bg-amber-500 text-white text-xs font-bold px-3 py-1 flex items-center gap-1">
                    <Crown size={12} /> WINNER
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="text-sm font-semibold">{s.submitterName}</div>
                      {s.submitterEmail && (
                        <div className="text-xs text-muted-foreground">
                          {s.submitterEmail}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {formatRelativeTime(s.createdAt)}
                      </div>
                    </div>
                  </div>
                  <a
                    href={s.submissionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary hover:underline break-all block mb-2"
                  >
                    {s.submissionUrl}
                  </a>
                  {s.description && (
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap mb-3">
                      {s.description}
                    </p>
                  )}
                  {subEmbed && (
                    <iframe
                      src={subEmbed}
                      allowFullScreen
                      className="w-full aspect-video rounded-md border border-border mb-3"
                    />
                  )}
                  <div className="flex gap-2">
                    {!isWinner ? (
                      <Button
                        size="sm"
                        onClick={() => pickWinner(s.id)}
                        disabled={picking !== null}
                      >
                        <Crown size={13} /> Pick as winner
                      </Button>
                    ) : (
                      <span className="text-xs text-amber-700 font-semibold">
                        Winner selected
                      </span>
                    )}
                    <a href={s.submissionUrl} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm">
                        <ExternalLink size={13} /> Open
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
