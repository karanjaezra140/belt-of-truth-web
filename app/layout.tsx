import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700", "900"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
      className={`${playfair.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
