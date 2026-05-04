import { useParams, Link } from "wouter";
import {
  useGetGig,
  useListGigReplies,
  useUpdateGig,
  useDeleteGigReply,
  getGetGigQueryKey,
  getListGigRepliesQueryKey,
  getListGigsQueryKey,
} from "@workspace/api-client-react";
import type { GigReply } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { MessageSquare, Share2, Mic, Trash2, Clock, Wrench, Zap, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const TYPE_ICONS: Record<string, React.ElementType> = { task: Zap, hourly: Clock, build: Wrench };
const STATUS_COLORS: Record<string, string> = {
  open: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  closed: "bg-gray-100 text-gray-600",
  in_progress: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

function VoiceNotePlayer({ path }: { path: string }) {
  const src = `/api/storage/objects/${path.replace(/^\/objects\//, "")}`;
  return (
    <audio controls src={src} className="w-full h-8 mt-1" data-testid={`audio-voice-note-${path}`} />
  );
}

function ReplyCard({ reply, onDelete }: { reply: GigReply; onDelete: (id: number) => void }) {
  return (
    <div className="border-b border-border last:border-0 px-4 py-3" data-testid={`reply-card-${reply.id}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground">{reply.senderName}</div>
          {reply.message && <div className="text-sm text-muted-foreground mt-1">{reply.message}</div>}
          {reply.voiceNotePath && <VoiceNotePlayer path={reply.voiceNotePath} />}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
          </span>
          <button
            data-testid={`button-delete-reply-${reply.id}`}
            onClick={() => onDelete(reply.id)}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GigDetail() {
  const { id } = useParams<{ id: string }>();
  const gigId = Number(id);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: gig, isLoading } = useGetGig(gigId, {
    query: { enabled: !!gigId, queryKey: getGetGigQueryKey(gigId) },
  });
  const { data: replies, isLoading: repliesLoading } = useListGigReplies(gigId, {
    query: { enabled: !!gigId, queryKey: getListGigRepliesQueryKey(gigId) },
  });

  const updateGig = useUpdateGig();
  const deleteReply = useDeleteGigReply();

  function handleWhatsApp() {
    if (!gig) return;
    const url = `${window.location.href.split("/gigs/")[0]}/gigs/public/${gig.publicSlug}`;
    const text = `Hey, check out this gig: ${gig.title}\n${gig.description.slice(0, 120)}...\nApply here: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  async function handleStatusChange(newStatus: "open" | "closed" | "in_progress") {
    try {
      await updateGig.mutateAsync({ id: gigId, data: { status: newStatus } });
      qc.invalidateQueries({ queryKey: getGetGigQueryKey(gigId) });
      qc.invalidateQueries({ queryKey: getListGigsQueryKey() });
      toast({ title: "Status updated" });
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  }

  async function handleDeleteReply(replyId: number) {
    try {
      await deleteReply.mutateAsync({ id: replyId });
      qc.invalidateQueries({ queryKey: getListGigRepliesQueryKey(gigId) });
      toast({ title: "Reply deleted" });
    } catch {
      toast({ title: "Failed to delete reply", variant: "destructive" });
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-40 rounded-md" />
      </div>
    );
  }

  if (!gig) {
    return <div className="p-6 text-sm text-muted-foreground">Gig not found.</div>;
  }

  const Icon = TYPE_ICONS[gig.type] ?? Zap;
  const slugPublicUrl = `${window.location.href.split("/gigs/")[0]}/gigs/public/${gig.publicSlug}`;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-4">
        <Link href="/gigs">
          <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">&larr; Back to Gigs</span>
        </Link>
      </div>

      {/* Gig info */}
      <div className="border border-border rounded-md bg-card p-5 mb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-primary/10 text-primary">
                <Icon size={11} /> {gig.type}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[gig.status]}`}>
                {gig.status.replace("_", " ")}
              </span>
            </div>
            <h1 className="text-lg font-bold text-foreground" data-testid="gig-title">{gig.title}</h1>
            <p className="text-sm text-muted-foreground mt-2">{gig.description}</p>
            {gig.requirements && (
              <p className="text-xs text-muted-foreground mt-2 border-l-2 border-border pl-3">{gig.requirements}</p>
            )}
            {gig.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {gig.tags.map((t) => (
                  <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t}</span>
                ))}
              </div>
            )}
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              {gig.budgetMin && <span>Budget: ${gig.budgetMin}–${gig.budgetMax}</span>}
              {gig.hourlyRate && <span>Rate: ${gig.hourlyRate}/hr</span>}
              <span>Posted {formatDistanceToNow(new Date(gig.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>

        {/* Recording player */}
        {gig.recordingPath && (
          <div className="mt-4">
            <div className="text-xs font-medium text-muted-foreground mb-1">Screen recording</div>
            <video
              src={`/api/storage/objects/${gig.recordingPath.replace(/^\/objects\//, "")}`}
              controls
              className="w-full rounded-md max-h-60"
              data-testid="gig-recording-player"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
          <Button size="sm" variant="outline" onClick={handleWhatsApp} data-testid="button-whatsapp-share">
            <Share2 size={13} className="mr-1.5" /> Share on WhatsApp
          </Button>
          <a href={slugPublicUrl} target="_blank" rel="noreferrer">
            <Button size="sm" variant="outline" data-testid="button-view-public">
              <ExternalLink size={13} className="mr-1.5" /> Public page
            </Button>
          </a>
          <div className="flex gap-1">
            {(["open", "in_progress", "closed"] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={gig.status === s ? "default" : "ghost"}
                onClick={() => handleStatusChange(s)}
                data-testid={`button-status-${s}`}
              >
                {s.replace("_", " ")}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Replies */}
      <div className="border border-border rounded-md bg-card">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <MessageSquare size={14} className="text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Replies ({replies?.length ?? 0})</span>
        </div>
        {repliesLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded" />)}
          </div>
        ) : replies && replies.length > 0 ? (
          replies.map((r) => <ReplyCard key={r.id} reply={r} onDelete={handleDeleteReply} />)
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No replies yet. Share the public link to get responses.
          </div>
        )}
      </div>
    </div>
  );
}
