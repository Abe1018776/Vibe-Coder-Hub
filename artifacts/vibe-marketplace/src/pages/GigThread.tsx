import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRequestUploadUrl } from "@workspace/api-client-react";
import { useState, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Upload, Send, Clock, Wrench, Zap, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface GigMessage {
  id: number;
  conversationId: number;
  senderType: "poster" | "freelancer";
  content: string | null;
  voiceNotePath: string | null;
  createdAt: string;
}

interface ThreadData {
  id: number;
  gigId: number;
  gigTitle: string | null;
  gigSlug: string | null;
  freelancerName: string;
  freelancerEmail: string | null;
  threadToken: string;
  createdAt: string;
  messages: GigMessage[];
}

function VoiceNotePlayer({ path }: { path: string }) {
  const src = `/api/storage/objects/${path.replace(/^\/objects\//, "")}`;
  return <audio controls src={src} className="w-full h-8 mt-1" />;
}

function MessageBubble({ message }: { message: GigMessage }) {
  const isFreelancer = message.senderType === "freelancer";
  return (
    <div className={cn("flex flex-col mb-3", isFreelancer ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2.5 text-sm",
          isFreelancer
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        <div className="text-xs font-semibold mb-1 opacity-70">
          {isFreelancer ? "You" : "Poster"}
        </div>
        {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
        {message.voiceNotePath && <VoiceNotePlayer path={message.voiceNotePath} />}
      </div>
      <span className="text-xs text-muted-foreground mt-1 px-1">
        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
      </span>
    </div>
  );
}

export default function GigThread() {
  const { token } = useParams<{ token: string }>();
  const qc = useQueryClient();
  const requestUpload = useRequestUploadUrl();

  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [voiceNotePath, setVoiceNotePath] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const { data: thread, isLoading } = useQuery<ThreadData>({
    queryKey: ["thread", token],
    queryFn: async () => {
      const res = await fetch(`/api/thread/${token}`);
      if (!res.ok) throw new Error("Thread not found");
      return res.json();
    },
    enabled: !!token,
    refetchInterval: 10000,
  });

  const sendMessage = useMutation({
    mutationFn: async ({ content, voiceNotePath }: { content?: string; voiceNotePath?: string }) => {
      const res = await fetch(`/api/thread/${token}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content || undefined, voiceNotePath: voiceNotePath || undefined }),
      });
      if (!res.ok) throw new Error("Failed to send");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["thread", token] });
      setText("");
      setAudioBlob(null);
      setAudioUrl(null);
      setVoiceNotePath(null);
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

  async function handleSend() {
    if (!text.trim() && !audioBlob) return;
    let vPath = voiceNotePath;
    if (audioBlob && !voiceNotePath) {
      vPath = await uploadVoiceNote();
    }
    await sendMessage.mutateAsync({ content: text.trim() || undefined, voiceNotePath: vPath || undefined });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-xl space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-60 rounded-md" />
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-muted-foreground text-sm">Thread not found or link has expired.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-3 flex items-center gap-3">
        <div className="text-xs font-semibold text-primary uppercase tracking-widest shrink-0">Vibe Marketplace</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground truncate" data-testid="thread-gig-title">
            {thread.gigTitle ?? "Gig conversation"}
          </div>
          <div className="text-xs text-muted-foreground">Your private thread · {thread.freelancerName}</div>
        </div>
        {thread.gigSlug && (
          <a href={`/gigs/public/${thread.gigSlug}`} target="_blank" rel="noreferrer">
            <Button size="sm" variant="ghost" className="shrink-0">
              <ExternalLink size={13} />
            </Button>
          </a>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 max-w-2xl mx-auto w-full">
        {thread.messages.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-10">No messages yet.</div>
        ) : (
          thread.messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}
      </div>

      {/* Reply box */}
      <div className="border-t border-border bg-card p-4 max-w-2xl mx-auto w-full">
        <div className="space-y-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Reply to the poster..."
            rows={3}
            data-testid="input-thread-reply"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend();
            }}
          />

          <div className="flex items-center gap-2 flex-wrap">
            {!recording && !audioUrl && (
              <Button type="button" variant="outline" size="sm" onClick={startRecording}>
                <Mic size={13} className="mr-1.5" /> Voice note
              </Button>
            )}
            {recording && (
              <Button type="button" variant="destructive" size="sm" onClick={stopRecording}>
                <MicOff size={13} className="mr-1.5" /> Stop
              </Button>
            )}
            {audioUrl && !voiceNotePath && (
              <>
                <audio src={audioUrl} controls className="h-8" />
                <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={uploadVoiceNote}>
                  <Upload size={13} className="mr-1.5" /> {uploading ? "Uploading..." : "Upload"}
                </Button>
                <button type="button" onClick={() => { setAudioBlob(null); setAudioUrl(null); }} className="text-xs text-muted-foreground hover:text-destructive">
                  Remove
                </button>
              </>
            )}
            {voiceNotePath && (
              <span className="text-xs text-green-600 font-medium">Voice note ready</span>
            )}

            <div className="flex-1" />
            <Button
              onClick={handleSend}
              disabled={sendMessage.isPending || (!text.trim() && !audioBlob)}
              size="sm"
              data-testid="button-send-thread-reply"
            >
              <Send size={13} className="mr-1.5" />
              {sendMessage.isPending ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
