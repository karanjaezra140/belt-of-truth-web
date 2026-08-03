import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CustomCursor } from "@/components/CustomCursor";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // `contents` keeps this div invisible to the flex layout (Navbar/main/Footer
    // still stack directly as body's flex children) while still scoping the
    // native-cursor-hiding rule to just the site pages, not Studio/Admin/reader.
    <div className="contents [@media(pointer:fine)]:cursor-none">
      <CustomCursor />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
