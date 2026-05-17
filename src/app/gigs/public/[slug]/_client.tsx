"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, Clock, Wrench, Zap, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { Gig } from "@/lib/db";

const schema = z.object({
  freelancerName: z.string().min(1, "Required"),
  freelancerEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  message: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const ICONS: Record<string, React.ElementType> = { task: Zap, hourly: Clock, build: Wrench };

export default function GigPublicClient({ gig, slug }: { gig: Gig; slug: string }) {
  const t = useTranslations("gigs");
  const [submitting, setSubmitting] = useState(false);
  const [threadToken, setThreadToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const Icon = ICONS[gig.type] ?? Zap;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { freelancerName: "", freelancerEmail: "", message: "" },
  });

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/public/gigs/${slug}/apply`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          freelancerName: data.freelancerName,
          freelancerEmail: data.freelancerEmail || null,
          message: data.message || null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const result = await res.json();
      setThreadToken(result.threadToken);
    } catch {
      toast.error("Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  }

  function threadUrl(token: string) {
    return `${typeof window !== "undefined" ? window.location.origin : ""}/gigs/thread/${token}`;
  }

  if (threadToken) {
    const url = threadUrl(threadToken);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-sm w-full">
          <CheckCircle size={40} className="text-primary mx-auto mb-3" />
          <h2 className="text-lg font-bold">{t("applyForm.success")}</h2>
          <p className="text-sm text-muted-foreground mt-2 mb-5">
            {t("applyForm.bookmarkHint")}
            <br />
            <strong>{t("applyForm.dontLose")}</strong>
          </p>
          <div className="border border-border rounded-md bg-card p-4 text-start space-y-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {t("applyForm.yourThreadLink")}
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted px-2 py-1.5 rounded break-all">
                {url}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                <Copy size={13} />
                {copied ? t("applyForm.copied") : t("applyForm.copy")}
              </Button>
            </div>
            <a href={url}>
              <Button size="sm" className="w-full mt-1">
                <ExternalLink size={13} /> {t("applyForm.openThread")}
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
          <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
            Vibe Coder Hub
          </div>
          <h1 className="text-2xl font-bold">{gig.title}</h1>
          <div className="flex justify-center items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
              <Icon size={11} /> {t(`type.${gig.type}`)}
            </span>
          </div>
        </div>

        <div className="border border-border rounded-md bg-card p-4 mb-5">
          <p className="text-sm">{gig.description}</p>
          {gig.requirements && (
            <p className="text-xs text-muted-foreground mt-3 border-s-2 border-primary/30 ps-2">
              {gig.requirements}
            </p>
          )}
          {gig.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {gig.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="mt-3 text-xs text-muted-foreground flex gap-4">
            {gig.budgetMin && (
              <span>
                {t("budget")}: ${gig.budgetMin}
                {gig.budgetMax ? `–$${gig.budgetMax}` : ""}
              </span>
            )}
            {gig.hourlyRate && (
              <span>
                {t("hourlyRate")}: ${gig.hourlyRate}/hr
              </span>
            )}
          </div>
          {gig.loomUrl && (() => {
            const match = gig.loomUrl.match(/loom\.com\/(?:share|embed)\/([a-f0-9]+)/);
            if (!match) return null;
            return (
              <div className="mt-4">
                <div className="text-xs font-semibold text-muted-foreground mb-2">
                  {t("videoWalkthrough")}
                </div>
                <iframe
                  src={`https://www.loom.com/embed/${match[1]}`}
                  allowFullScreen
                  className="w-full aspect-video rounded-md border border-border"
                />
              </div>
            );
          })()}
        </div>

        <div className="border border-border rounded-md bg-card p-5">
          <h2 className="text-sm font-semibold mb-4">{t("publicHeader")}</h2>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <Label>{t("applyForm.name")}</Label>
              <Input {...form.register("freelancerName")} placeholder="Alex Vibe" />
              {form.formState.errors.freelancerName && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.freelancerName.message}
                </p>
              )}
            </div>
            <div>
              <Label>{t("applyForm.email")}</Label>
              <Input
                {...form.register("freelancerEmail")}
                type="email"
                placeholder="you@example.com"
              />
              {form.formState.errors.freelancerEmail && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.freelancerEmail.message}
                </p>
              )}
            </div>
            <div>
              <Label>{t("applyForm.message")}</Label>
              <Textarea
                {...form.register("message")}
                rows={3}
                placeholder="Tell them why you're the right fit…"
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? t("applyForm.sending") : t("applyForm.submit")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
