/**
 * Client-side image downscale + re-encode so users can pick any photo (phone
 * camera shots are often 5–15 MB) without hitting upload limits or bloating storage.
 *
 * Strategy: cap the longest edge, re-encode as WebP (falls back to JPEG) at a
 * sensible quality. Animated GIFs and SVGs pass through untouched (canvas would
 * flatten/animate-strip them). On any failure we return the original file so an
 * upload is never blocked by compression.
 */

export type CompressOptions = {
  /** Longest-edge cap in pixels. */
  maxEdge?: number;
  /** Encoder quality 0–1. */
  quality?: number;
  /** Skip files already smaller than this (bytes) AND within maxEdge. */
  skipUnderBytes?: number;
};

const PASS_THROUGH = new Set(["image/gif", "image/svg+xml"]);

export async function compressImage(
  file: File,
  opts: CompressOptions = {},
): Promise<File> {
  const { maxEdge = 1600, quality = 0.82, skipUnderBytes = 200 * 1024 } = opts;

  if (typeof window === "undefined") return file;
  if (!file.type.startsWith("image/")) return file;
  if (PASS_THROUGH.has(file.type)) return file;

  try {
    const bitmap = await loadBitmap(file);
    const { width, height } = bitmap;
    const longest = Math.max(width, height);
    const scale = longest > maxEdge ? maxEdge / longest : 1;

    // Already small and within bounds — leave it alone.
    if (scale === 1 && file.size <= skipUnderBytes) {
      closeBitmap(bitmap);
      return file;
    }

    const targetW = Math.round(width * scale);
    const targetH = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      closeBitmap(bitmap);
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    closeBitmap(bitmap);

    const blob = await encode(canvas, quality);
    if (!blob || blob.size >= file.size) return file; // no win — keep original

    const ext = blob.type === "image/webp" ? "webp" : "jpg";
    const base = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${base}.${ext}`, { type: blob.type });
  } catch {
    return file;
  }
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file);
    } catch {
      /* fall through to <img> */
    }
  }
  return await new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("decode failed"));
    };
    img.src = url;
  });
}

function closeBitmap(b: ImageBitmap | HTMLImageElement) {
  if ("close" in b && typeof b.close === "function") b.close();
}

function encode(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (webp) => {
        if (webp && webp.type === "image/webp") return resolve(webp);
        // Browser ignored webp — fall back to JPEG.
        canvas.toBlob((jpg) => resolve(jpg), "image/jpeg", quality);
      },
      "image/webp",
      quality,
    );
  });
}
