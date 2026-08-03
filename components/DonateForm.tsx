"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { donationSchema, type DonationValues } from "@/lib/validation/checkout";
import { DONATION_PRESETS_KES } from "@/lib/site-config";
import { MPESA_TILL_ENABLED } from "@/lib/mpesa";
import { useMpesaStkPush } from "@/components/useMpesaStkPush";
import { cn, NOTCH_ALT } from "@/lib/utils";

type Status = "idle" | "submitting" | "error";
type PaymentMethod = "paystack" | "mpesa";

export function DonateForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(
    DONATION_PRESETS_KES[1]
  );
  const [method, setMethod] = useState<PaymentMethod>("paystack");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const mpesa = useMpesaStkPush();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DonationValues>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      amountKes: DONATION_PRESETS_KES[1],
      donorName: "",
      donorEmail: "",
    },
  });

  const amount = watch("amountKes");

  function choosePreset(value: number) {
    setSelectedPreset(value);
    setValue("amountKes", value, { shouldValidate: true });
  }

  async function onSubmit(values: DonationValues) {
    if (method === "mpesa") {
      if (!/^(?:254|0)?(7|1)\d{8}$/.test(phone.trim())) {
        setPhoneError("Please enter a valid Safaricom number, e.g. 07XXXXXXXX");
        return;
      }
      setPhoneError("");
      await mpesa.pay({ type: "donation", ...values, phone: phone.trim() });
      return;
    }

    setStatus("submitting");
    setErrorMessage("");
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "donation", ...values }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error ?? "Something went wrong.");

      window.location.assign(data.authorizationUrl);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const inputClasses =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[15px] transition-colors focus:border-navy-800 focus:outline-none";

  if (method === "mpesa" && mpesa.status === "success") {
    return (
      <div
        className={cn(
          "mx-auto flex max-w-md flex-col items-center gap-3 bg-white p-8 text-center shadow-[0_3px_16px_rgba(0,0,0,0.08)]",
          NOTCH_ALT
        )}
      >
        <div className="text-4xl">✅</div>
        <h3 className="font-display text-xl font-bold text-navy-800">Thank You!</h3>
        <p className="text-sm text-gray-600">
          We&apos;ve received your M-Pesa payment. We truly appreciate your support for Belt of
          Truth Mentorship.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn(
        "mx-auto flex max-w-md flex-col gap-4 bg-white p-8 text-left shadow-[0_3px_16px_rgba(0,0,0,0.08)]",
        NOTCH_ALT
      )}
      noValidate
    >
      <div>
        <span className="mb-2 block text-sm font-medium text-gray-700">
          Choose an amount (KES)
        </span>
        <div className="grid grid-cols-4 gap-2">
          {DONATION_PRESETS_KES.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => choosePreset(preset)}
              className={cn(
                "rounded-lg border px-2 py-2.5 text-sm font-semibold transition-colors",
                selectedPreset === preset
                  ? "border-navy-800 bg-navy-800 text-white"
                  : "border-gray-300 text-gray-700 hover:border-navy-800"
              )}
            >
              {preset.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="amountKes" className="mb-1 block text-sm font-medium text-gray-700">
          Or enter a custom amount
        </label>
        <input
          id="amountKes"
          type="number"
          min={50}
          step={1}
          className={inputClasses}
          {...register("amountKes", {
            valueAsNumber: true,
            onChange: () => setSelectedPreset(null),
          })}
        />
        {errors.amountKes && (
          <p className="mt-1 text-sm text-red-600">{errors.amountKes.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="donorName" className="mb-1 block text-sm font-medium text-gray-700">
          Your Name
        </label>
        <input id="donorName" type="text" className={inputClasses} {...register("donorName")} />
        {errors.donorName && (
          <p className="mt-1 text-sm text-red-600">{errors.donorName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="donorEmail" className="mb-1 block text-sm font-medium text-gray-700">
          Your Email
        </label>
        <input id="donorEmail" type="email" className={inputClasses} {...register("donorEmail")} />
        {errors.donorEmail && (
          <p className="mt-1 text-sm text-red-600">{errors.donorEmail.message}</p>
        )}
      </div>

      {MPESA_TILL_ENABLED && (
        <div>
          <span className="mb-2 block text-sm font-medium text-gray-700">Payment method</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMethod("paystack")}
              className={cn(
                "rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors",
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
                "rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors",
                method === "mpesa"
                  ? "border-navy-800 bg-navy-800 text-white"
                  : "border-gray-300 text-gray-700 hover:border-navy-800"
              )}
            >
              M-Pesa Till
            </button>
          </div>
        </div>
      )}

      {method === "mpesa" && MPESA_TILL_ENABLED && (
        <div>
          <label htmlFor="mpesaPhone" className="mb-1 block text-sm font-medium text-gray-700">
            M-Pesa Phone Number
          </label>
          <input
            id="mpesaPhone"
            type="tel"
            placeholder="07XXXXXXXX"
            className={inputClasses}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {phoneError && <p className="mt-1 text-sm text-red-600">{phoneError}</p>}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "submitting" || mpesa.status === "requesting" || mpesa.status === "waiting"}
        className="mt-1 w-full rounded-full bg-gold-500 px-6 py-3.5 font-semibold text-navy-950 transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {method === "mpesa"
          ? mpesa.status === "requesting"
            ? "Sending request…"
            : mpesa.status === "waiting"
              ? "Check your phone…"
              : `Donate KSh ${Number(amount || 0).toLocaleString()} via M-Pesa`
          : status === "submitting"
            ? "Redirecting to Paystack…"
            : `Donate KSh ${Number(amount || 0).toLocaleString()}`}
      </button>

      {method === "mpesa" && mpesa.status === "waiting" && (
        <p className="text-center text-sm font-medium text-navy-800">
          📲 Check your phone and enter your M-Pesa PIN to complete the donation.
        </p>
      )}

      {status === "error" && (
        <p className="text-sm font-medium text-red-600">⚠️ {errorMessage}</p>
      )}
      {method === "mpesa" && (mpesa.status === "error" || mpesa.status === "failed") && (
        <p className="text-sm font-medium text-red-600">⚠️ {mpesa.errorMessage}</p>
      )}

      <p className="text-center text-xs text-gray-400">
        {method === "mpesa"
          ? "Secured by Safaricom M-Pesa."
          : "Secured by Paystack. Supports M-Pesa, cards, and bank transfer."}
      </p>
    </form>
  );
}
