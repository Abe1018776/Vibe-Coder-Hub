import { useParams, Link } from "wouter";
import {
  useGetGig,
  useUpdateGig,
  getGetGigQueryKey,
  getListGigsQueryKey,
} from "@workspace/api-client-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRequestUploadUrl } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import { MessageSquare, Share2, Mic, MicOff, Upload, Send, Clock, Wrench, Zap, ExternalLink, ChevronLeft, Paperclip, X, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<string, React.ElementType> = { task: Zap, hourly: Clock, build: Wrench };
const STATUS_COLORS: Record<string, string> = {
  open: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  closed: "bg-gray-100 text-gray-600",
  in_progress: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

interface GigMessage {
  id: number;
  conversationId: number;
  senderType: "poster" | "freelancer";
  content: string | null;
  voiceNotePath: string | null;
  fileAttachmentPath: string | null;
  fileAttachmentName: string | null;
  createdAt: string;
}

interface Conversation {
  id: number;
  gigId: number;
  freelancerName: string;
  freelancerEmail: string | null;
  threadToken: string;
  createdAt: string;
  messages: GigMessage[];
}

function VoiceNotePlayer({ path }: { path: string }) {
  const src = `/api/storage/objects/${path.replace(/^\/objects\//, "")}`;
  return <audio controls src={src} className="w-full h-8 mt-1" data-testid={`audio-voice-note-${path}`} />;
}

function isImagePath(name: string | null) {
  if (!name) return false;
  return /\.(png|jpe?g|gif|webp|svg)$/i.test(name);
}

function FileAttachment({ path, name }: { path: string; name: string | null }) {
  const src = `/api/storage/objects/${path.replace(/^\/objects\//, "")}`;
  const displayName = name ?? "Attachment";
  if (isImagePath(name)) {
    return (
      <a href={src} target="_blank" rel="noreferrer" className="block mt-2">
        <img src={src} alt={displayName} className="max-w-full max-h-48 rounded-md border border-border object-contain" />
        <span className="text-xs underline opacity-70">{displayName}</span>
      </a>
    );
  }
  return (
    <a
      href={src}
      target="_blank"
      rel="noreferrer"
      download={displayName}
      className="mt-2 inline-flex items-center gap-1.5 text-xs underline opacity-80 hover:opacity-100"
    >
      <FileText size={12} />
      {displayName}
    </a>
  );
}

function MessageBubble({ message }: { message: GigMessage }) {
  const isPoster = message.senderType === "poster";
  return (
    <div className={cn("flex flex-col mb-3", isPoster ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-3 py-2 text-sm",
          isPoster
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        <div className="text-xs font-semibold mb-1 opacity-70">{isPoster ? "You" : "Applicant"}</div>
        {message.content && <p className="whitespace-pre-wrap text-sm">{message.content}</p>}
        {message.voiceNotePath && <VoiceNotePlayer path={message.voiceNotePath} />}
        {message.fileAttachmentPath && (
          <FileAttachment path={message.fileAttachmentPath} name={message.fileAttachmentName} />
        )}
      </div>
      <span className="text-xs text-muted-foreground mt-0.5 px-1">
        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
      </span>
    </div>
  );
}

function PosterReplyBox({ conversationId, onSent }: { conversationId: number; onSent: () => void }) {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [voiceNotePath, setVoiceNotePath] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [fileAttachmentPath, setFileAttachmentPath] = useState<string | null>(null);
  const [fileUploading, setFileUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const requestUpload = useRequestUploadUrl();

  const sendMessage = useMutation({
    mutationFn: async ({
      content,
      voiceNotePath,
      fileAttachmentPath,
      fileAttachmentName,
    }: {
      content?: string;
      voiceNotePath?: string;
      fileAttachmentPath?: string;
      fileAttachmentName?: string;
    }) => {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content || undefined,
          voiceNotePath: voiceNotePath || undefined,
          fileAttachmentPath: fileAttachmentPath || undefined,
          fileAttachmentName: fileAttachmentName || undefined,
        }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to send");
      return res.json();
    },
    onSuccess: () => {
      setText("");
      setAudioBlob(null);
      setAudioUrl(null);
      setVoiceNotePath(null);
      setAttachedFile(null);
      setFileAttachmentPath(null);
      onSent();
    },
  });

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    mediaRecorderRef.current = mr;
    chunksRef.current = [];
    mr.ondataavailable = (e) => chunksRef.current.push(e.data);
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      setAudioBlob(blob);
      setAudioUrl(URL.createObjectURL(blob));
      stream.getTracks().forEach((t) => t.stop());
    };
    mr.start();
    setRecording(true);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  async function uploadVoiceNote(): Promise<string | null> {
    if (!audioBlob) return null;
    setUploading(true);
    try {
      const { uploadURL, objectPath } = await requestUpload.mutateAsync({
        data: { name: "voice-note.webm", size: audioBlob.size, contentType: "audio/webm" },
      });
      await fetch(uploadURL, { method: "PUT", body: audioBlob, headers: { "Content-Type": "audio/webm" } });
      setVoiceNotePath(objectPath);
      return objectPath;
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachedFile(file);
    setFileAttachmentPath(null);
  }

  async function uploadAttachedFile(): Promise<string | null> {
    if (!attachedFile) return null;
    setFileUploading(true);
    try {
      const { uploadURL, objectPath } = await requestUpload.mutateAsync({
        data: { name: attachedFile.name, size: attachedFile.size, contentType: attachedFile.type || "application/octet-stream" },
      });
      await fetch(uploadURL, { method: "PUT", body: attachedFile, headers: { "Content-Type": attachedFile.type || "application/octet-stream" } });
      setFileAttachmentPath(objectPath);
      return objectPath;
    } finally {
      setFileUploading(false);
    }
  }

  async function handleSend() {
    if (!text.trim() && !audioBlob && !attachedFile) return;
    let vPath = voiceNotePath;
    if (audioBlob && !voiceNotePath) vPath = await uploadVoiceNote();
    let fPath = fileAttachmentPath;
    if (attachedFile && !fileAttachmentPath) fPath = await uploadAttachedFile();
    await sendMessage.mutateAsync({
      content: text.trim() || undefined,
      voiceNotePath: vPath || undefined,
      fileAttachmentPath: fPath || undefined,
      fileAttachmentName: attachedFile?.name || undefined,
    });
  }

  const isSending = sendMessage.isPending || uploading || fileUploading;
  const canSend = !isSending && (!!text.trim() || !!audioBlob || !!attachedFile);

  return (
    <div className="border-t border-border p-3 space-y-2">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Reply to this applicant..."
        rows={2}
        data-testid="input-poster-reply"
        onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend(); }}
        className="text-sm"
      />

      {/* Attached file preview */}
      {attachedFile && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-md">
          <FileText size={12} />
          <span className="truncate flex-1">{attachedFile.name}</span>
          {fileAttachmentPath
            ? <span className="text-green-600 font-medium shrink-0">Ready</span>
            : fileUploading
              ? <span className="shrink-0">Uploading…</span>
              : null}
          <button
            type="button"
            onClick={() => { setAttachedFile(null); setFileAttachmentPath(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
            className="shrink-0 hover:text-destructive"
          >
            <X size={12} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {!recording && !audioUrl && (
          <Button type="button" variant="outline" size="sm" onClick={startRecording}>
            <Mic size={13} className="mr-1" /> Voice
          </Button>
        )}
        {recording && (
          <Button type="button" variant="destructive" size="sm" onClick={stopRecording}>
            <MicOff size={13} className="mr-1" /> Stop
          </Button>
        )}
        {audioUrl && !voiceNotePath && (
          <>
            <audio src={audioUrl} controls className="h-7" />
            <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={uploadVoiceNote}>
              <Upload size={13} className="mr-1" /> {uploading ? "..." : "Upload"}
            </Button>
            <button type="button" onClick={() => { setAudioBlob(null); setAudioUrl(null); }} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
          </>
        )}
        {voiceNotePath && <span className="text-xs text-green-600">Voice ready</span>}

        {/* File attachment button */}
        {!attachedFile && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            data-testid="button-attach-file-poster"
          >
            <Paperclip size={13} className="mr-1" /> File
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          data-testid="input-file-poster"
        />

        <div className="flex-1" />
        <Button size="sm" onClick={handleSend} disabled={!canSend} data-testid="button-poster-send">
          <Send size={13} className="mr-1" />
          {isSending ? "Sending..." : "Reply"}
        </Button>
      </div>
    </div>
  );
}

function ConversationPanel({ gigId }: { gigId: number }) {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<number | null>(null);

  const { data: conversations, isLoading } = useQuery<Conversation[]>({
    queryKey: ["gig-conversations", gigId],
    queryFn: async () => {
      const res = await fetch(`/api/gigs/${gigId}/conversations`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    refetchInterval: 15000,
  });

  const activeConv = conversations?.find((c) => c.id === selected);

  if (isLoading) {
    return <div className="p-4 space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded" />)}</div>;
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        No applicants yet. Share the public link to get responses.
      </div>
    );
  }

  if (selected !== null && activeConv) {
    return (
      <div className="flex flex-col h-[420px]">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
          <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
            <ChevronLeft size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-foreground truncate">{activeConv.freelancerName}</div>
            {activeConv.freelancerEmail && (
              <div className="text-xs text-muted-foreground truncate">{activeConv.freelancerEmail}</div>
            )}
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatDistanceToNow(new Date(activeConv.createdAt), { addSuffix: true })}
          </span>
        </div>

        <div className="flex-1 overflow-auto p-3">
          {activeConv.messages.map((m) => <MessageBubble key={m.id} message={m} />)}
        </div>

        <PosterReplyBox
          conversationId={activeConv.id}
          onSent={() => qc.invalidateQueries({ queryKey: ["gig-conversations", gigId] })}
        />
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((c) => {
        const last = c.messages[c.messages.length - 1];
        const hasNew = c.messages.some((m) => m.senderType === "freelancer");
        return (
          <button
            key={c.id}
            data-testid={`conversation-item-${c.id}`}
            onClick={() => setSelected(c.id)}
            className="w-full text-left px-4 py-3 hover:bg-accent transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="font-medium text-sm text-foreground flex items-center gap-2">
                {c.freelancerName}
                {hasNew && <span className="w-2 h-2 rounded-full bg-primary inline-block" />}
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
              </span>
            </div>
            {last && (
              <div className="text-xs text-muted-foreground mt-0.5 truncate">
                {last.senderType === "poster" ? "You: " : ""}{last.content ?? (last.voiceNotePath ? "(voice note)" : last.fileAttachmentPath ? `(file: ${last.fileAttachmentName ?? "attachment"})` : "")}
              </div>
            )}
            {c.freelancerEmail && (
              <div className="text-xs text-muted-foreground/60 truncate">{c.freelancerEmail}</div>
            )}
          </button>
        );
      })}
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

  const updateGig = useUpdateGig();

  function handleWhatsApp() {
    if (!gig) return;
    const base = window.location.href.split("/vibe-marketplace/")[0] + "/vibe-marketplace";
    const url = `${base}/gigs/public/${gig.publicSlug}`;
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
  const base = window.location.href.split("/vibe-marketplace/")[0] + "/vibe-marketplace";
  const slugPublicUrl = `${base}/gigs/public/${gig.publicSlug}`;

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

      {/* Applicants */}
      <div className="border border-border rounded-md bg-card">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <MessageSquare size={14} className="text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground" data-testid="applicants-header">Applicants</span>
        </div>
        <ConversationPanel gigId={gigId} />
      </div>
    </div>
  );
}
