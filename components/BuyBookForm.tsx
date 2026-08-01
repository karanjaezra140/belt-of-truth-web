"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookPurchaseSchema, type BookPurchaseValues } from "@/lib/validation/checkout";

type Status = "idle" | "submitting" | "error";

export function BuyBookForm({ bookSlug }: { bookSlug: string }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookPurchaseValues>({
    resolver: zodResolver(bookPurchaseSchema),
    defaultValues: { bookSlug, buyerName: "", buyerEmail: "" },
  });

  async function onSubmit(values: BookPurchaseValues) {
    setStatus("submitting");
    setErrorMessage("");
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "book", ...values }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong.");
      window.location.assign(data.authorizationUrl);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-full bg-gold-500 px-4 py-2.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400"
      >
        Buy Now
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-2 border-t border-gray-100 pt-3"
      noValidate
    >
      <input type="hidden" {...register("bookSlug")} />
      <input
        type="text"
        placeholder="Your full name"
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-navy-800 focus:outline-none"
        {...register("buyerName")}
      />
      {errors.buyerName && <p className="text-xs text-red-600">{errors.buyerName.message}</p>}

      <input
        type="email"
        placeholder="Your email"
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-navy-800 focus:outline-none"
        {...register("buyerEmail")}
      />
      {errors.buyerEmail && <p className="text-xs text-red-600">{errors.buyerEmail.message}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-gold-500 px-4 py-2.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Redirecting…" : "Continue to Payment"}
      </button>
      {status === "error" && <p className="text-xs font-medium text-red-600">⚠️ {errorMessage}</p>}
    </form>
  );
}
