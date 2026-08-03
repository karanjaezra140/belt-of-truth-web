"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { resizeImageForUpload } from "@/lib/client-image-resize";

type DocumentPhotoUploaderProps = {
  documentId: string;
  title: string;
  /** e.g. "programs" or "focus-areas" — matches /api/admin/<kind>/[id]/photo */
  kind: "programs" | "focus-areas" | "free-resources";
};

export function DocumentPhotoUploader({ documentId, title, kind }: DocumentPhotoUploaderProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function upload() {
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    setStatus("uploading");
    try {
      const formData = new FormData();
      formData.append("photo", await resizeImageForUpload(file));
      const res = await fetch(`/api/admin/${kind}/${documentId}/photo`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong.");
      setStatus("success");
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
      <p className="text-sm font-medium text-gray-700 sm:w-56 sm:shrink-0">{title}</p>
      <input ref={inputRef} type="file" accept="image/*" className="flex-1 text-sm" />
      <button
        type="button"
        onClick={upload}
        disabled={status === "uploading"}
        className="rounded-full border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-navy-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "uploading" ? "Uploading…" : "Upload"}
      </button>
      {status === "success" && <p className="text-xs font-medium text-green-700">✅ Saved.</p>}
      {status === "error" && <p className="text-xs font-medium text-red-600">⚠️ {errorMessage}</p>}
    </div>
  );
}
