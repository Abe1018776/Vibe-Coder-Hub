import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useRequestUploadUrl } from "@workspace/api-client-react";
import type { Gig } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useState, useRef } from "react";
import { Mic, MicOff, Upload, Clock, Wrench, Zap, CheckCircle, Copy, ExternalLink } from "lucide-react";

const schema = z.object({
  freelancerName: z.string().min(1, "Name required"),
  freelancerEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  message: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const TYPE_ICONS: Record<string, React.ElementType> = { task: Zap, hourly: Clock, build: Wrench };

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function GigPublicBySlug() {
  const { slug } = useParams<{ slug: string }>();

  const { data: gig, isLoading } = useQuery<Gig>({
    queryKey: ["gigs", "public", slug],
    queryFn: async () => {
      const res = await fetch(`/api/gigs/public/${slug}`);
      if (!res.ok) throw new Error("Gig not found");
      return res.json();
    },
    enabled: !!slug,
    retry: false,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { freelancerName: "", freelancerEmail: "", message: "" },
  });

  const requestUpload = useRequestUploadUrl();

  const [submitting, setSubmitting] = useState(false);
  const [threadToken, setThreadToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [voiceNotePath, setVoiceNotePath] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

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

  async function onSubmit(data: FormData) {
    if (!slug) return;
    setSubmitting(true);
    try {
      let path = voiceNotePath;
      if (audioBlob && !voiceNotePath) {
        path = await uploadVoiceNote();
      }
      const res = await fetch(`/api/gigs/public/${slug}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          freelancerName: data.freelancerName,
          freelancerEmail: data.freelancerEmail || undefined,
          message: data.message || undefined,
          voiceNotePath: path || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to apply");
      const result = await res.json();
      setThreadToken(result.threadToken);
    } finally {
      setSubmitting(false);
    }
  }

  function getThreadUrl(token: string) {
    return `${window.location.origin}${basePath}/gigs/thread/${token}`;
  }

  function copyThreadLink(token: string) {
    navigator.clipboard.writeText(getThreadUrl(token));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-xl space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 rounded-md" />
        </div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-muted-foreground text-sm">Gig not found or no longer available.</div>
      </div>
    );
  }

  const Icon = TYPE_ICONS[gig.type] ?? Zap;

  if (threadToken) {
    const threadUrl = getThreadUrl(threadToken);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-sm w-full">
          <CheckCircle size={40} className="text-primary mx-auto mb-3" />
          <h2 className="text-lg font-bold text-foreground" data-testid="reply-submitted-message">Application sent!</h2>
          <p className="text-sm text-muted-foreground mt-2 mb-5">
            Bookmark the link below to check the poster's reply and continue the conversation.
            <br /><strong>Don't lose this link — it's the only way back to your thread.</strong>
          </p>

          <div className="border border-border rounded-md bg-card p-4 text-left space-y-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your private thread link</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted px-2 py-1.5 rounded text-foreground break-all" data-testid="thread-link">
                {threadUrl}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyThreadLink(threadToken)}
                data-testid="button-copy-thread-link"
              >
                <Copy size={13} className="mr-1" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <a href={threadUrl} target="_blank" rel="noreferrer">
              <Button size="sm" className="w-full mt-1" data-testid="button-open-thread">
                <ExternalLink size={13} className="mr-1.5" /> Open your thread
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="text-center mb-6">
          <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Vibe Marketplace</div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="public-gig-title">{gig.title}</h1>
          <div className="flex justify-center items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
              <Icon size={11} /> {gig.type}
            </span>
          </div>
        </div>

        <div className="border border-border rounded-md bg-card p-4 mb-5">
          <p className="text-sm text-foreground">{gig.description}</p>
          {gig.requirements && (
            <p className="text-xs text-muted-foreground mt-3 border-l-2 border-primary/30 pl-2">{gig.requirements}</p>
          )}
          {gig.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {gig.tags.map((t) => (
                <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t}</span>
              ))}
            </div>
          )}
          <div className="mt-3 text-xs text-muted-foreground flex gap-4">
            {gig.budgetMin && <span>Budget: ${gig.budgetMin}–${gig.budgetMax}</span>}
            {gig.hourlyRate && <span>Rate: ${gig.hourlyRate}/hr</span>}
          </div>
        </div>

        <div className="border border-border rounded-md bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Apply for this gig</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="freelancerName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Your name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Alex Vibe" data-testid="input-sender-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="freelancerEmail" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="you@example.com" data-testid="input-freelancer-email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="message" render={({ field }) => (
                <FormItem>
                  <FormLabel>Message <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} placeholder="Tell them why you're the right fit..." data-testid="input-reply-message" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div>
                <div className="text-sm font-medium mb-2">Voice note <span className="text-muted-foreground font-normal">(optional)</span></div>
                <div className="flex gap-2 flex-wrap items-center">
                  {!recording && !audioUrl && (
                    <Button type="button" variant="outline" size="sm" onClick={startRecording} data-testid="button-start-recording">
                      <Mic size={13} className="mr-1.5" /> Record voice note
                    </Button>
                  )}
                  {recording && (
                    <Button type="button" variant="destructive" size="sm" onClick={stopRecording} data-testid="button-stop-recording">
                      <MicOff size={13} className="mr-1.5" /> Stop recording
                    </Button>
                  )}
                  {audioUrl && !voiceNotePath && (
                    <>
                      <audio src={audioUrl} controls className="h-8" data-testid="audio-preview" />
                      <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={uploadVoiceNote} data-testid="button-upload-voice-note">
                        <Upload size={13} className="mr-1.5" /> {uploading ? "Uploading..." : "Upload"}
                      </Button>
                      <button type="button" onClick={() => { setAudioBlob(null); setAudioUrl(null); }} className="text-xs text-muted-foreground hover:text-destructive">
                        Remove
                      </button>
                    </>
                  )}
                  {voiceNotePath && (
                    <span className="text-xs text-green-600 font-medium">Voice note uploaded</span>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={submitting} data-testid="button-submit-reply">
                {submitting ? "Sending..." : "Submit application"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
