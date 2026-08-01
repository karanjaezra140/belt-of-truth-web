import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema } from "@/lib/validation/contact";
import { sanityWriteClient } from "@/lib/sanity/client";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid submission" },
      { status: 400 }
    );
  }

  // Honeypot: bots fill every field, real users never see this one.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true });
  }

  const { name, email, phone, interest, message } = parsed.data;

  // Save first — this is the record that shows up in the admin dashboard and
  // must not be lost even if email sending below isn't configured or fails.
  let saved = false;
  if (sanityWriteClient) {
    try {
      await sanityWriteClient.create({
        _type: "contactSubmission",
        name,
        email,
        phone: phone || undefined,
        interest: interest || undefined,
        message,
        submittedAt: new Date().toISOString(),
      });
      saved = true;
    } catch (err) {
      console.error("Failed to save contact submission to Sanity:", err);
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_INBOX_EMAIL;
  let emailed = false;

  if (apiKey && toEmail) {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL ?? "Belt of Truth Website <onboarding@resend.dev>",
      to: toEmail,
      replyTo: email,
      subject: `New contact form message from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        phone ? `Phone: ${phone}` : null,
        interest ? `Interested in: ${interest}` : null,
        "",
        message,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    if (error) {
      console.error("Resend error:", error);
    } else {
      emailed = true;
    }
  } else {
    console.error(
      "Contact form: RESEND_API_KEY / CONTACT_INBOX_EMAIL not set — email notification skipped:",
      { name, email }
    );
  }

  if (!saved && !emailed) {
    return NextResponse.json(
      { error: "Could not submit your message right now. Please try again later." },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true });
}
