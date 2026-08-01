import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // These do native/binary work (PDF rasterization + image compositing for
  // the protected ebook reader) and must not be bundled into the edge/client
  // graph — keep them as real Node dependencies resolved at runtime.
  serverExternalPackages: ["@napi-rs/canvas", "pdfjs-dist", "sharp"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
};

export default nextConfig;
