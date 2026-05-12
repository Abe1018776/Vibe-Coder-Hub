"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Trophy,
  Calendar,
  DollarSign,
  CheckCircle,
  Copy,
  ExternalLink,
  Crown,
} from "lucide-react";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/utils";
import type { Competition } from "@/lib/db";

type PublicSubmission = {
  id: number;
  submitterName: string;
  submissionUrl: string;
  loomUrl: string | null;
  description: string | null;
  createdAt: Date | string;
};

const schema = z.object({
  submitterName: z.string().min(1, "Required"),
  submitterEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  submissionUrl: z.string().url("Must be a valid URL"),
  loomUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

function loomEmbedUrl(url: string) {
  const match = url.match(/loom\.com\/(?:share|embed)\/([a-f0-9]+)/);
  if (!match) return null;
  return `https://www.loom.com/embed/${match[1]}`;
}

export default function CompetitionPublicClient({
  competition,
  submissions,
  slug,
}: {
  competition: Competition;
  submissions: PublicSubmission[];
  slug: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ threadToken: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      submitterName: "",
      submitterEmail: "",
      submissionUrl: "",
      loomUrl: "",
      description: "",
    },
  });

  const deadline = new Date(competition.deadline);
  const deadlinePassed = deadline.getTime() < Date.now();
  const canSubmit = !deadlinePassed && competition.status === "open";
  const embed = competition.loomUrl ? loomEmbedUrl(competition.loomUrl) : null;
  const winner = submissions.find((s) => s.id === competition.winnerSubmissionId);

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/public/competitions/${slug}/submit`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          submitterName: data.submitterName,
          submitterEmail: data.submitterEmail || null,
          submissionUrl: data.submissionUrl,
          loomUrl: data.loomUrl || null,
          description: data.description || null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const result = await res.json();
      setSubmitted({ threadToken: result.threadToken });
    } catch {
      toast.error("Failed to submit entry");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-sm w-full">
          <CheckCircle size={40} className="text-primary mx-auto mb-3" />
          <h2 className="text-lg font-bold">Entry submitted!</h2>
          <p className="text-sm text-muted-foreground mt-2 mb-5">
            Your submission is in. The host will pick a winner manually before the
            deadline.
          </p>
          <div className="border border-border rounded-md bg-card p-4 text-left space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Your tracking code
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted px-2 py-1.5 rounded break-all">
                {submitted.threadToken}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(submitted.threadToken);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                <Copy size={13} />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Save this to identify your entry if you need to follow up.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
            Vibe Coder Hub · Competition
          </div>
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            <Trophy size={22} className="text-amber-500" />
            {competition.title}
          </h1>
          <div className="flex justify-center items-center gap-3 mt-3 flex-wrap text-sm">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold">
              <DollarSign size={13} />${competition.prizeAmount.toLocaleString()} prize
            </span>
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${
                deadlinePassed
                  ? "bg-destructive/10 text-destructive"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <Calendar size={13} />
              {deadlinePassed ? "Closed " : "Deadline "}
              {deadline.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="border border-border rounded-md bg-card p-5 mb-5">
          <h2 className="text-sm font-semibold mb-2">The task</h2>
          <p className="text-sm whitespace-pre-wrap">{competition.description}</p>
          {competition.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {competition.tags.map((t) => (
                <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
          )}
          {embed && (
            <div className="mt-4">
              <div className="text-xs font-semibold text-muted-foreground mb-2">
                Walkthrough video
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
                      className="text-xs text-primary hover:underline break-all inline-flex items-center gap-1"
                    >
                      <ExternalLink size={11} /> {u}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {winner && (
          <div className="border-2 border-amber-500 rounded-md bg-amber-50 p-5 mb-5">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-sm mb-2">
              <Crown size={16} /> Winner: {winner.submitterName}
            </div>
            <a
              href={winner.submissionUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary hover:underline break-all"
            >
              {winner.submissionUrl}
            </a>
            {winner.description && (
              <p className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap">
                {winner.description}
              </p>
            )}
          </div>
        )}

        {canSubmit ? (
          <div className="border border-border rounded-md bg-card p-5 mb-5">
            <h2 className="text-sm font-semibold mb-1">Submit your entry</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Upload your file to Imgur, Google Drive, Dropbox, or similar — then paste
              the public link below.
            </p>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>Your name</Label>
                  <Input {...form.register("submitterName")} placeholder="Alex" />
                  {form.formState.errors.submitterName && (
                    <p className="text-xs text-destructive mt-1">
                      {form.formState.errors.submitterName.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Email (optional)</Label>
                  <Input
                    {...form.register("submitterEmail")}
                    type="email"
                    placeholder="you@example.com"
                  />
                  {form.formState.errors.submitterEmail && (
                    <p className="text-xs text-destructive mt-1">
                      {form.formState.errors.submitterEmail.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label>Submission URL</Label>
                <Input
                  {...form.register("submissionUrl")}
                  placeholder="https://imgur.com/abc.png or https://drive.google.com/..."
                />
                {form.formState.errors.submissionUrl && (
                  <p className="text-xs text-destructive mt-1">
                    {form.formState.errors.submissionUrl.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Loom walkthrough (optional)</Label>
                <Input
                  {...form.register("loomUrl")}
                  placeholder="https://www.loom.com/share/..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Explain your approach with a quick video
                </p>
              </div>
              <div>
                <Label>Description (optional)</Label>
                <Textarea
                  {...form.register("description")}
                  rows={3}
                  placeholder="Notes about your submission, tools used, etc."
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Submitting…" : "Submit entry"}
              </Button>
            </form>
          </div>
        ) : (
          <div className="border border-border rounded-md bg-muted/40 p-5 mb-5 text-center text-sm text-muted-foreground">
            {deadlinePassed
              ? "Submissions closed — deadline has passed."
              : `Submissions are ${competition.status}.`}
          </div>
        )}

        {submissions.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-semibold mb-3">
              Entries ({submissions.length})
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {submissions.map((s) => {
                const isWinner = s.id === competition.winnerSubmissionId;
                return (
                  <div
                    key={s.id}
                    className={`border rounded-md bg-card p-3 ${
                      isWinner ? "border-amber-500" : "border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-semibold">{s.submitterName}</div>
                      {isWinner && (
                        <span className="text-xs text-amber-700 font-bold flex items-center gap-0.5">
                          <Crown size={11} /> WINNER
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {formatRelativeTime(s.createdAt)}
                    </div>
                    <a
                      href={s.submissionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary hover:underline break-all"
                    >
                      {s.submissionUrl}
                    </a>
                    {s.description && (
                      <p className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap line-clamp-3">
                        {s.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
