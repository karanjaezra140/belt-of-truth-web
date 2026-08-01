"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong.");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-5">
      <h1 className="font-display text-2xl font-bold text-navy-800">Admin Login</h1>
      <p className="mt-2 text-center text-sm text-gray-600">
        Belt of Truth Mentorship dashboard
      </p>

      <form onSubmit={onSubmit} className="mt-8 w-full space-y-3" noValidate>
        <input
          type="password"
          placeholder="Admin password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-[15px] transition-colors focus:border-navy-800 focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full rounded-full bg-gold-500 px-6 py-3 font-semibold text-navy-950 transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? "Checking…" : "Log In"}
        </button>
        {status === "error" && (
          <p className="text-center text-sm font-medium text-red-600">⚠️ {errorMessage}</p>
        )}
      </form>
    </section>
  );
}
