import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema } from "@/lib/validation/contact";

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

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_INBOX_EMAIL;

  if (!apiKey || !toEmail) {
    console.error(
      "Contact form submitted but RESEND_API_KEY / CONTACT_INBOX_EMAIL are not set:",
      parsed.data
    );
    return NextResponse.json(
      { error: "Email sending is not configured yet. Please try again later." },
      { status: 503 }
    );
  }

  const { name, email, phone, interest, message } = parsed.data;
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
    return NextResponse.json(
      { error: "Could not send your message. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
