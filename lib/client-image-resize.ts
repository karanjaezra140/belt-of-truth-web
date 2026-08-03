"use client";

const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.85;
const SKIP_RESIZE_BELOW_BYTES = 300 * 1024;

/**
 * Downscales and re-encodes an image in the browser before it's uploaded.
 * Phone photos routinely come in at 4000px+/several MB, and every upload
 * here crosses the network twice at that size (browser -> our server ->
 * Sanity) — shrinking client-side cuts both hops down substantially.
 */
export async function resizeImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }
  if (file.size <= SKIP_RESIZE_BELOW_BYTES) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob || blob.size >= file.size) {
      return file;
    }

    const newName = file.name.replace(/\.[^./]+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    return file;
  }
}
