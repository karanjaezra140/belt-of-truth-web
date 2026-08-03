"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { resizeImageForUpload } from "@/lib/client-image-resize";

export function AddBookForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "error" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");
    try {
      const formData = new FormData(e.currentTarget);
      const cover = formData.get("cover");
      if (cover instanceof File && cover.size > 0) {
        formData.set("cover", await resizeImageForUpload(cover));
      }
      const res = await fetch("/api/admin/books", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong.");
      setStatus("success");
      formRef.current?.reset();
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const inputClasses =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-navy-800 focus:outline-none";

  return (
    <form ref={formRef} onSubmit={onSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2" noValidate>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
        <input name="title" type="text" required className={inputClasses} />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
        <textarea name="description" rows={3} required className={inputClasses} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Price (KES)</label>
        <input name="priceKes" type="number" min={1} required className={inputClasses} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Cover photo (max 4MB)
        </label>
        <input name="cover" type="file" accept="image/*" required className={inputClasses} />
      </div>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-full bg-gold-500 px-6 py-2.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? "Saving…" : "Add Book"}
        </button>
        {status === "success" && (
          <p className="mt-2 text-sm font-medium text-green-700">
            ✅ Book added. To attach the ebook PDF for the protected reader, open it in Sanity
            Studio → Books & Ebooks.
          </p>
        )}
        {status === "error" && (
          <p className="mt-2 text-sm font-medium text-red-600">⚠️ {errorMessage}</p>
        )}
      </div>
    </form>
  );
}
