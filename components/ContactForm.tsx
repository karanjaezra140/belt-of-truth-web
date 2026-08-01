"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormValues } from "@/lib/validation/contact";
import { CONTACT_INTERESTS } from "@/lib/site-config";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", interest: "", message: "", company: "" },
  });

  async function onSubmit(values: ContactFormValues) {
    setStatus("submitting");
    setErrorMessage("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Something went wrong. Please try again.");
      }

      setStatus("success");
      reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const inputClasses =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[15px] transition-colors focus:border-navy-800 focus:outline-none";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto flex max-w-xl flex-col gap-3.5 text-left"
      noValidate
    >
      {/* Honeypot field — hidden from real users, bots tend to fill every field */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" type="text" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
          Your Name
        </label>
        <input id="name" type="text" placeholder="e.g. John Kamau" className={inputClasses} {...register("name")} />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
          Your Email
        </label>
        <input id="email" type="email" placeholder="e.g. john@email.com" className={inputClasses} {...register("email")} />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
          Phone Number (optional)
        </label>
        <input id="phone" type="tel" placeholder="e.g. 0712 345 678" className={inputClasses} {...register("phone")} />
      </div>

      <div>
        <label htmlFor="interest" className="mb-1 block text-sm font-medium text-gray-700">
          What are you interested in?
        </label>
        <select id="interest" className={inputClasses} {...register("interest")}>
          <option value="">-- Select an option --</option>
          {CONTACT_INTERESTS.map((interest) => (
            <option key={interest} value={interest}>
              {interest}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-700">
          Your Message
        </label>
        <textarea
          id="message"
          placeholder="Tell us how we can help you..."
          rows={5}
          className={`${inputClasses} resize-y`}
          {...register("message")}
        />
        {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-1.5 w-full rounded-lg bg-gold-500 px-6 py-3.5 font-semibold text-navy-950 transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Send Message"}
      </button>

      {status === "success" && (
        <p className="mt-1 font-medium text-green-700">
          ✅ Message sent! We&apos;ll get back to you soon.
        </p>
      )}
      {status === "error" && (
        <p className="mt-1 font-medium text-red-600">⚠️ {errorMessage}</p>
      )}
    </form>
  );
}
