"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/image/upload";

/**
 * Identity media picker that mirrors the live profile hero: a full-width cover
 * banner with the avatar overlapping it. Each is click-to-upload or paste-URL.
 * Emits hidden inputs `cover_url` and `avatar_url` for the profile form action.
 */
export function CoverAvatarInput({
  defaultCover,
  defaultAvatar,
  fallbackInitial,
}: {
  defaultCover?: string | null;
  defaultAvatar?: string | null;
  fallbackInitial: string;
}) {
  const [cover, setCover] = useState(defaultCover ?? "");
  const [avatar, setAvatar] = useState(defaultAvatar ?? "");
  const [busy, setBusy] = useState<"cover" | "avatar" | null>(null);
  const coverFile = useRef<HTMLInputElement>(null);
  const avatarFile = useRef<HTMLInputElement>(null);

  async function upload(
    e: React.ChangeEvent<HTMLInputElement>,
    which: "cover" | "avatar",
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(which);
    try {
      const { url, error } = await uploadImage(file, "avatars");
      if (error || !url) {
        toast.error(error ?? "Upload failed.");
        return;
      }
      if (which === "cover") setCover(url);
      else setAvatar(url);
    } finally {
      setBusy(null);
      e.target.value = "";
    }
  }

  return (
    <div>
      <input type="hidden" name="cover_url" value={cover} />
      <input type="hidden" name="avatar_url" value={avatar} />

      <div className="relative overflow-hidden rounded-2xl border border-border">
        <div className="h-32 w-full bg-teal-50">
          {cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <button
          type="button"
          onClick={() => coverFile.current?.click()}
          disabled={busy === "cover"}
          className="absolute right-3 top-3 inline-flex h-8 items-center gap-1.5 rounded-[10px] border border-border bg-surface/95 px-3 text-xs font-medium text-ink shadow-[var(--shadow-xs)] backdrop-blur transition-colors hover:bg-secondary disabled:opacity-60"
        >
          {busy === "cover" ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
          {cover ? "Change cover" : "Add cover"}
        </button>
        {cover && (
          <button
            type="button"
            onClick={() => setCover("")}
            aria-label="Remove cover"
            className="absolute left-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-ink/70 text-white"
          >
            <X size={13} />
          </button>
        )}
        <input ref={coverFile} type="file" accept="image/*" className="hidden" onChange={(e) => upload(e, "cover")} />

        <div className="absolute -bottom-8 left-5">
          <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-surface bg-teal-50 text-teal-700 shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="grid h-full w-full place-items-center font-display text-2xl">{fallbackInitial}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => avatarFile.current?.click()}
            disabled={busy === "avatar"}
            aria-label="Change photo"
            className="absolute -right-1 bottom-0 grid h-8 w-8 place-items-center rounded-full border border-border bg-surface text-ink shadow-[var(--shadow-sm)] transition-colors hover:bg-secondary disabled:opacity-60"
          >
            {busy === "avatar" ? <Loader2 size={13} className="animate-spin" /> : <Camera size={14} />}
          </button>
          <input ref={avatarFile} type="file" accept="image/*" className="hidden" onChange={(e) => upload(e, "avatar")} />
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Cover image URL — optional</span>
          <input
            type="url" inputMode="url" value={cover} onChange={(e) => setCover(e.target.value)}
            placeholder="…upload above, or paste an image URL"
            className="h-9 w-full rounded-[10px] border border-border bg-surface px-3 text-sm text-ink outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Profile photo URL</span>
          <input
            type="url" inputMode="url" value={avatar} onChange={(e) => setAvatar(e.target.value)}
            placeholder="…upload above, or paste an image URL"
            className="h-9 w-full rounded-[10px] border border-border bg-surface px-3 text-sm text-ink outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
        </label>
      </div>
    </div>
  );
}
