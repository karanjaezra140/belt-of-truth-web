import { createClient, type SanityClient } from "next-sanity";
import { apiVersion, dataset, isSanityConfigured, projectId } from "@/sanity/env";

export { isSanityConfigured };

export const sanityClient: SanityClient | null = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
      perspective: "published",
    })
  : null;

// Write-enabled client for recording donations from the Paystack webhook.
// Requires a Sanity API token with Editor access (SANITY_API_TOKEN) in
// addition to the project ID — server-only, never exposed to the client.
const canWrite = isSanityConfigured && Boolean(process.env.SANITY_API_TOKEN);

export const sanityWriteClient: SanityClient | null = canWrite
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      token: process.env.SANITY_API_TOKEN,
      perspective: "raw",
    })
  : null;
