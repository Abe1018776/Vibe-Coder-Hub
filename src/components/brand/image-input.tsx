"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

/**
 * Image picker that accepts EITHER a Supabase Storage upload OR a pasted URL.
 * Carries the resulting URL in a hidden input named `name` for the form action.
 */
export function ImageInput({
  name,
  bucket,
  defaultValue,
  shape = "rect",
  fallbackInitial,
}: {
  name: string;
  bucket: "avatars" | "project-media";
  defaultValue?: string | null;
  shape?: "circle" | "rect";
  fallbackInitial?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }
    setUploading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Your session expired — please sign in again.");
        return;
      }
      const ext = (file.name.split(".").pop() || "png").toLowerCase();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) {
        toast.error("Upload failed. Try a different image or paste a URL.");
        return;
      }
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      setUrl(data.publicUrl);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const isCircle = shape === "circle";

  return (
    <div>
      <input type="hidden" name={name} value={url} />
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "relative flex shrink-0 items-center justify-center overflow-hidden bg-teal-50 text-teal-600",
            isCircle ? "h-16 w-16 rounded-full" : "aspect-[16/9] w-40 rounded-card",
          )}
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="font-display text-xl">{fallbackInitial ?? "+"}</span>
          )}
          {url && (
            <button
              type="button"
              onClick={() => setUrl("")}
              aria-label="Remove image"
              className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-border bg-surface px-3 text-sm font-medium text-ink transition-colors hover:bg-secondary disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Upload size={15} />
            )}
            {uploading ? "Uploading…" : "Upload image"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          <input
            type="url"
            inputMode="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="…or paste an image URL"
            className="h-9 w-64 max-w-full rounded-[10px] border border-border bg-surface px-3 text-sm text-ink outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
    </div>
  );
}
