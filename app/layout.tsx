import type { Metadata } from "next";
import { Barlow, PT_Serif } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CustomCursor } from "@/components/CustomCursor";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";
import "./globals.css";

// Matches the reference site's typography: a classic, moderate-contrast
// serif for headings (PT Serif — close to the plain book/newspaper serif
// look in their screenshots) and Barlow for everything else, the exact
// sans-serif family their theme loads for body text, nav, and buttons.
const ptSerif = PT_Serif({
  variable: "--font-pt-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  manifest: "/manifest.json",
  title: {
    default: `${SITE_NAME} — Raising a Generation Rooted in Truth`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Belt of Truth Mentorship empowers young people across Kenya to overcome self-destructive behaviors and live purposeful, Christ-centred lives through mentorship, habit-change programs, and community outreach.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Raising a Generation Rooted in Truth`,
    description:
      "Empowering young people across Kenya to overcome destructive habits, find their voice, and live impactful, purpose-driven lives.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ptSerif.variable} ${barlow.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <CustomCursor />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
