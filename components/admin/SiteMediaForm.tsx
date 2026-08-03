"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { resizeImageForUpload } from "@/lib/client-image-resize";

type FieldKey = "heroImage" | "missionVisionPhoto" | "contactHeroPhoto";

const FIELDS: { key: FieldKey; label: string; hint: string }[] = [
  {
    key: "heroImage",
    label: "Add a homepage slideshow photo",
    hint: "Adds one more photo to the rotation — doesn't replace existing ones.",
  },
  {
    key: "missionVisionPhoto",
    label: "Mission & Vision photo (homepage)",
    hint: "Replaces the current one, if any.",
  },
  {
    key: "contactHeroPhoto",
    label: "Contact page banner photo",
    hint: "Replaces the current one, if any.",
  },
];

export function SiteMediaForm() {
  const router = useRouter();
  const [busyField, setBusyField] = useState<FieldKey | null>(null);
  const [message, setMessage] = useState<{ field: FieldKey; text: string; error: boolean } | null>(
    null
  );
  const inputRefs = useRef<Partial<Record<FieldKey, HTMLInputElement | null>>>({});

  async function upload(field: FieldKey) {
    const input = inputRefs.current[field];
    const file = input?.files?.[0];
    if (!file) return;

    setBusyField(field);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append(field, await resizeImageForUpload(file));
      const res = await fetch("/api/admin/site-media", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong.");
      setMessage({ field, text: "✅ Saved.", error: false });
      if (input) input.value = "";
      router.refresh();
    } catch (err) {
      setMessage({
        field,
        text: `⚠️ ${err instanceof Error ? err.message : "Something went wrong."}`,
        error: true,
      });
    } finally {
      setBusyField(null);
    }
  }

  return (
    <div className="space-y-5">
      {FIELDS.map((field) => (
        <div key={field.key} className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
          <div className="sm:w-64 sm:shrink-0">
            <p className="text-sm font-medium text-gray-700">{field.label}</p>
            <p className="text-xs text-gray-400">{field.hint}</p>
          </div>
          <input
            ref={(el) => {
              inputRefs.current[field.key] = el;
            }}
            type="file"
            accept="image/*"
            className="flex-1 text-sm"
          />
          <button
            type="button"
            onClick={() => upload(field.key)}
            disabled={busyField === field.key}
            className="rounded-full border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-navy-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busyField === field.key ? "Uploading…" : "Upload"}
          </button>
          {message?.field === field.key && (
            <p className={`text-xs font-medium ${message.error ? "text-red-600" : "text-green-700"}`}>
              {message.text}
            </p>
          )}
        </div>
      ))}
      <p className="text-xs text-gray-400">
        Need to add a video instead? Use Sanity Studio → Website Content → Site Settings —
        there&apos;s no file-size limit there.
      </p>
    </div>
  );
}
