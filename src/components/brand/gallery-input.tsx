"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/image/upload";
import { cn } from "@/lib/utils";

/**
 * Multi-image picker for extra project screenshots (up to `max`). Each URL is
 * carried in a hidden input named `name` so the server action reads them with
 * formData.getAll(name). Reuses the compressing uploader.
 */
export function GalleryInput({
  name,
  defaultValue = [],
  max = 5,
}: {
  name: string;
  defaultValue?: string[];
  max?: number;
}) {
  const [urls, setUrls] = useState<string[]>(defaultValue);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const room = max - urls.length;
    if (room <= 0) {
      toast.error(`Up to ${max} images.`);
      return;
    }
    setUploading(true);
    try {
      for (const file of files.slice(0, room)) {
        const { url, error } = await uploadImage(file, "project-media");
        if (error || !url) {
          toast.error(error ?? "Upload failed.");
          continue;
        }
        setUrls((cur) => (cur.length < max ? [...cur, url] : cur));
      }
      if (files.length > room) {
        toast.message(`Added ${room} — limit is ${max} images.`);
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const remove = (u: string) => setUrls((cur) => cur.filter((x) => x !== u));
  const full = urls.length >= max;

  return (
    <div>
      {urls.map((u) => (
        <input key={u} type="hidden" name={name} value={u} />
      ))}

      <div className="flex flex-wrap gap-2">
        {urls.map((u) => (
          <div
            key={u}
            className="relative aspect-[4/3] w-24 overflow-hidden rounded-chip border border-border bg-teal-50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(u)}
              aria-label="Remove image"
              className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-white"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {!full && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className={cn(
              "flex aspect-[4/3] w-24 flex-col items-center justify-center gap-1 rounded-chip border border-dashed border-border bg-surface text-xs text-muted-foreground transition-colors hover:border-border-hover hover:text-ink disabled:opacity-60",
            )}
          >
            {uploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ImagePlus size={16} />
            )}
            {uploading ? "Uploading…" : "Add"}
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
      <p className="mt-1.5 text-xs text-muted-foreground">
        {urls.length}/{max} screenshots
      </p>
    </div>
  );
}
