"use client";

import { useCallback, useRef, useState } from "react";

export type MpesaStatus = "idle" | "requesting" | "waiting" | "success" | "failed" | "error";

const POLL_INTERVAL_MS = 3000;
const TIMEOUT_MS = 90_000;

/** Drives an M-Pesa STK push: kicks it off, then polls our own status route
 * until Safaricom's callback resolves it (there's no redirect flow to hook
 * into like Paystack's hosted checkout). */
export function useMpesaStkPush() {
  const [status, setStatus] = useState<MpesaStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const pay = useCallback(
    async (body: Record<string, unknown>) => {
      stopPolling();
      setErrorMessage("");
      setStatus("requesting");

      try {
        const res = await fetch("/api/mpesa/stkpush", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Something went wrong.");

        setStatus("waiting");
        const checkoutRequestId = data.checkoutRequestId as string;
        const startedAt = Date.now();

        pollRef.current = setInterval(async () => {
          if (Date.now() - startedAt > TIMEOUT_MS) {
            stopPolling();
            setStatus("failed");
            setErrorMessage("This took too long — please try again.");
            return;
          }
          try {
            const statusRes = await fetch(
              `/api/mpesa/status?checkoutRequestId=${encodeURIComponent(checkoutRequestId)}`
            );
            const statusData = await statusRes.json();
            if (statusData.status === "success") {
              stopPolling();
              setStatus("success");
            } else if (statusData.status === "failed") {
              stopPolling();
              setStatus("failed");
              setErrorMessage("The payment wasn't completed.");
            }
          } catch {
            // Transient network hiccup while polling — keep trying until timeout.
          }
        }, POLL_INTERVAL_MS);
      } catch (err) {
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      }
    },
    [stopPolling]
  );

  return { status, errorMessage, pay, stopPolling };
}
