"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookPurchaseSchema, type BookPurchaseValues } from "@/lib/validation/checkout";
import { MPESA_TILL_ENABLED } from "@/lib/mpesa";
import { useMpesaStkPush } from "@/components/useMpesaStkPush";
import { cn } from "@/lib/utils";

type Status = "idle" | "submitting" | "error";
type PaymentMethod = "paystack" | "mpesa";

export function BuyBookForm({ bookSlug }: { bookSlug: string }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("paystack");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const mpesa = useMpesaStkPush();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookPurchaseValues>({
    resolver: zodResolver(bookPurchaseSchema),
    defaultValues: { bookSlug, buyerName: "", buyerEmail: "" },
  });

  async function onSubmit(values: BookPurchaseValues) {
    if (method === "mpesa") {
      if (!/^(?:254|0)?(7|1)\d{8}$/.test(phone.trim())) {
        setPhoneError("Please enter a valid Safaricom number, e.g. 07XXXXXXXX");
        return;
      }
      setPhoneError("");
      await mpesa.pay({ type: "book", ...values, phone: phone.trim() });
      return;
    }

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

  if (mpesa.status === "success") {
    return (
      <div className="flex flex-col items-center gap-1 border-t border-gray-100 pt-3 text-center">
        <p className="text-sm font-semibold text-green-700">
          ✅ Payment received — check your email for the reader link.
        </p>
      </div>
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

      {MPESA_TILL_ENABLED && (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMethod("paystack")}
            className={cn(
              "rounded-md border px-2 py-2 text-xs font-semibold transition-colors",
              method === "paystack"
                ? "border-navy-800 bg-navy-800 text-white"
                : "border-gray-300 text-gray-700 hover:border-navy-800"
            )}
          >
            Card / Paystack
          </button>
          <button
            type="button"
            onClick={() => setMethod("mpesa")}
            className={cn(
              "rounded-md border px-2 py-2 text-xs font-semibold transition-colors",
              method === "mpesa"
                ? "border-navy-800 bg-navy-800 text-white"
                : "border-gray-300 text-gray-700 hover:border-navy-800"
            )}
          >
            M-Pesa Till
          </button>
        </div>
      )}

      {method === "mpesa" && MPESA_TILL_ENABLED && (
        <>
          <input
            type="tel"
            placeholder="M-Pesa phone, e.g. 07XXXXXXXX"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-navy-800 focus:outline-none"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {phoneError && <p className="text-xs text-red-600">{phoneError}</p>}
        </>
      )}

      <button
        type="submit"
        disabled={
          status === "submitting" || mpesa.status === "requesting" || mpesa.status === "waiting"
        }
        className="w-full rounded-full bg-gold-500 px-4 py-2.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {method === "mpesa"
          ? mpesa.status === "requesting"
            ? "Sending request…"
            : mpesa.status === "waiting"
              ? "Check your phone…"
              : "Pay with M-Pesa"
          : status === "submitting"
            ? "Redirecting…"
            : "Continue to Payment"}
      </button>

      {method === "mpesa" && mpesa.status === "waiting" && (
        <p className="text-center text-xs font-medium text-navy-800">
          📲 Check your phone and enter your M-Pesa PIN.
        </p>
      )}

      {status === "error" && <p className="text-xs font-medium text-red-600">⚠️ {errorMessage}</p>}
      {method === "mpesa" && (mpesa.status === "error" || mpesa.status === "failed") && (
        <p className="text-xs font-medium text-red-600">⚠️ {mpesa.errorMessage}</p>
      )}
    </form>
  );
}
