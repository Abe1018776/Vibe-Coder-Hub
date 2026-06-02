import { createClient } from "@/lib/supabase/client";
import { compressImage } from "./compress";

/** Generous pre-compression ceiling — almost any phone photo passes. */
const MAX_BYTES = 25 * 1024 * 1024;

export type UploadResult = { url?: string; error?: string };

/**
 * Compress (downscale + re-encode) then upload an image to a public Supabase
 * Storage bucket under `<uid>/<uuid>.<ext>`. Returns the public URL or a
 * user-friendly error string. Used by both ImageInput and GalleryInput.
 */
export async function uploadImage(
  file: File,
  bucket: "avatars" | "project-media",
): Promise<UploadResult> {
  if (!file.type.startsWith("image/")) {
    return { error: "Please choose an image file." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "That image is too large (max 25 MB)." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired — please sign in again." };

  const compressed = await compressImage(file);
  const ext = (compressed.name.split(".").pop() || "webp").toLowerCase();
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, compressed, { upsert: true, contentType: compressed.type });
  if (error) {
    return { error: "Upload failed. Try a different image or paste a URL." };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl };
}
