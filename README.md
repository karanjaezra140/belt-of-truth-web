# Belt of Truth Mentorship — Website

Next.js (App Router) + TypeScript + Tailwind rebuild of the Belt of Truth Mentorship site, with a Sanity-powered CMS, a working contact form, and Paystack-powered donations / book purchases.

## Stack

- **Next.js 16** (App Router, TypeScript) + **Tailwind CSS v4**
- **Sanity** — headless CMS, Studio embedded at `/studio`
- **Framer Motion** — scroll animations
- **react-hook-form + zod** — form validation
- **Resend** — contact form email delivery
- **Paystack** — donations and book checkout (supports M-Pesa, cards, bank transfer)

The site works out of the box with no accounts configured — pages fall back to the static content in [`lib/site-config.ts`](lib/site-config.ts) until Sanity, Resend, and Paystack are wired up. Set up each service when you're ready to make that feature live.

## Local development

```bash
npm install
cp .env.local.example .env.local   # then fill in the values you have
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Setting up the integrations

### 1. Sanity CMS (programs, core values, stories, books, site stats)

1. Create a free project at [sanity.io/manage](https://www.sanity.io/manage) → note the **Project ID**.
2. Add `NEXT_PUBLIC_SANITY_PROJECT_ID` to `.env.local`.
3. Run `npm run dev`, visit `/studio`, and log in with your Sanity account — the schemas (Program, Core Value, Testimony, Book, Site Settings) are already defined in [`sanity/schemaTypes`](sanity/schemaTypes).
4. Add content. Pages read from Sanity automatically and only fall back to the hardcoded content when a document type is empty.
5. For the Paystack webhook to record donations as Sanity documents, create an **Editor**-level API token (Sanity dashboard → API → Tokens) and set `SANITY_API_TOKEN`.

### 2. Resend (contact form)

1. Create a free account at [resend.com](https://resend.com).
2. Verify a sending domain (or use their `onboarding@resend.dev` sandbox address while testing).
3. Create an API key and set `RESEND_API_KEY`.
4. Set `CONTACT_INBOX_EMAIL` to the address that should receive submissions.

Until these are set, the contact form will show a friendly "not configured yet" error instead of failing silently — check the server logs, submissions are logged there too.

### 3. Paystack (donations + book purchases)

1. Create a free account at [paystack.com](https://paystack.com) and enable Kenya/KES + M-Pesa in the dashboard.
2. Grab your **Secret Key** (use the `sk_test_...` key first) from Settings → API Keys & Webhooks, and set `PAYSTACK_SECRET_KEY`.
3. In the same settings page, add a webhook pointing to `https://<your-domain>/api/paystack/webhook` (Paystack requires HTTPS, so this only works once deployed, or via a tunnel like `ngrok` locally).
4. Test with [Paystack's test cards](https://paystack.com/docs/payments/test-payments/) or the M-Pesa test flow before switching to live keys.

### 4. M-Pesa Till (optional second payment option — hidden by default)

A direct Safaricom Daraja integration for a Till (Buy Goods) number, as an alternative to Paystack's own M-Pesa channel. It's fully built but **stays hidden from the donate and book-purchase forms until you explicitly turn it on** — useful for testing against Safaricom's sandbox without it ever showing on the live site.

1. Create an app at [developer.safaricom.co.ke](https://developer.safaricom.co.ke), add the "Lipa Na M-Pesa Online" (STK Push) product, and copy the sandbox Consumer Key/Secret, test Till number, and passkey into `MPESA_CONSUMER_KEY` / `MPESA_CONSUMER_SECRET` / `MPESA_TILL_NUMBER` / `MPESA_PASSKEY`.
2. Register `https://<your-domain>/api/mpesa/callback` as the app's callback URL (also requires HTTPS, so a tunnel like `ngrok` is needed to test locally).
3. Test end-to-end with Safaricom's published sandbox test phone number and PIN.
4. When you're ready to show it as a payment option — after switching `MPESA_ENV` to `production` and swapping in your real Till's credentials — set `NEXT_PUBLIC_MPESA_TILL_ENABLED=true`.

## Deployment

Built for [Vercel](https://vercel.com/new): connect the repo, add the environment variables from `.env.local.example` in the Vercel project settings, and set `NEXT_PUBLIC_SITE_URL` to your production domain (needed for correct Open Graph tags, sitemap, and Paystack callback URLs).

## Project structure

```
app/                  routes (pages, API routes, sitemap/robots)
components/            shared React components
components/ui/          generic building blocks (Button, Card, CTASection, ...)
lib/site-config.ts     static fallback content + nav/social links
lib/sanity/            Sanity client, GROQ queries, types
lib/validation/         zod schemas shared by forms and API routes
sanity/                 Studio config, schema definitions
```
