import { createCanvas } from "@napi-rs/canvas";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
// pdfjs-dist loads its worker via a dynamic import tagged `webpackIgnore`/
// `vite-ignore` internally (correct for browsers, which fetch it as a real
// URL) — but that same tag makes Vercel's serverless file-tracer skip the
// file too, so it's silently missing from the deployed function and
// rendering fails with "Cannot find module .../pdf.worker.mjs" in
// production despite working fine locally. This plain static import isn't
// tagged, so the tracer picks it up; pdfjs's own runtime import of the same
// path then just resolves from Node's module cache.
import "pdfjs-dist/legacy/build/pdf.worker.mjs";
import sharp from "sharp";

// Rasterizes one page of a PDF to a plain PNG buffer. Called at most once
// per (book, page) ever — the result is cached as a Sanity image asset by
// the caller (see app/api/ebooks/[slug]/page/[n]/route.ts), so this is not
// on the hot path for repeat views.
//
// No custom canvas factory is passed to getDocument: pdfjs-dist's bundled
// Node build already auto-detects Node and uses its own @napi-rs/canvas
// -backed factory internally (confirmed by reading node_modules/pdfjs-dist
// /legacy/build/pdf.mjs directly — its NodeCanvasFactory literally
// `require("@napi-rs/canvas")`), which is what any internal sub-canvases
// (soft masks, pattern fills, etc.) will use. We only need to hand it a
// top-level canvas to render onto, created the same way.

const RENDER_SCALE = 2; // ~144dpi equivalent for crisp on-screen reading

export async function renderPdfPageToPng(
  pdfBytes: Uint8Array,
  pageNumber: number
): Promise<Buffer> {
  const doc = await getDocument({
    data: pdfBytes,
    disableWorker: true,
    isEvalSupported: false,
    useSystemFonts: true,
  } as unknown as Parameters<typeof getDocument>[0]).promise;

  if (pageNumber < 1 || pageNumber > doc.numPages) {
    throw new Error(`Page ${pageNumber} out of range (1-${doc.numPages})`);
  }

  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: RENDER_SCALE });
  const canvas = createCanvas(viewport.width, viewport.height);
  const context = canvas.getContext("2d");

  await page.render(
    { canvasContext: context, viewport } as unknown as Parameters<typeof page.render>[0]
  ).promise;

  return canvas.toBuffer("image/png");
}

// Tiles a translucent, rotated buyer-identifying label across the page so
// any leaked copy is traceable — this is the actual protection mechanism,
// not the UI's right-click/print blocking (which is cosmetic friction only).
export async function watermarkPng(plainPng: Buffer, label: string): Promise<Buffer> {
  const tileWidth = 320;
  const tileHeight = 160;
  const escaped = label.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c] ?? c));

  const tileSvg = Buffer.from(`
    <svg width="${tileWidth}" height="${tileHeight}" xmlns="http://www.w3.org/2000/svg">
      <text x="12" y="${tileHeight / 2}" font-family="sans-serif" font-size="13"
        fill="rgba(10,22,40,0.16)" transform="rotate(-28 ${tileWidth / 2} ${tileHeight / 2})">
        ${escaped}
      </text>
    </svg>
  `);

  return sharp(plainPng)
    .composite([{ input: tileSvg, tile: true, blend: "over" }])
    .png()
    .toBuffer();
}
