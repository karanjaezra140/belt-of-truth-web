import { NextResponse } from "next/server";
import { isAdminRequestAuthenticated } from "@/lib/admin-session";
import { sanityWriteClient } from "@/lib/sanity/client";
import { slugify } from "@/lib/slugify";

// Vercel serverless functions cap request bodies at 4.5MB — book covers fit
// comfortably under that. Larger files (the ebook PDF itself) still go
// through Sanity Studio, which uploads directly from the browser with no
// such limit.
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await isAdminRequestAuthenticated())) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (!sanityWriteClient) {
    return NextResponse.json(
      { error: "SANITY_API_TOKEN is not configured." },
      { status: 503 }
    );
  }

  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Invalid form submission." }, { status: 400 });
  }

  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const priceKes = Number(form.get("priceKes"));
  const cover = form.get("cover");

  if (!title || !description || !Number.isFinite(priceKes) || priceKes <= 0) {
    return NextResponse.json(
      { error: "Please fill in a title, description, and a valid price." },
      { status: 400 }
    );
  }

  if (!(cover instanceof File) || cover.size === 0) {
    return NextResponse.json({ error: "Please choose a cover image." }, { status: 400 });
  }
  if (cover.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "Cover image is too large (max 4MB)." },
      { status: 400 }
    );
  }

  try {
    const coverBuffer = Buffer.from(await cover.arrayBuffer());
    const coverAsset = await sanityWriteClient.assets.upload("image", coverBuffer, {
      filename: cover.name,
      contentType: cover.type || "image/jpeg",
    });

    await sanityWriteClient.create({
      _type: "book",
      title,
      slug: { _type: "slug", current: slugify(title) },
      description,
      priceKes,
      cover: { _type: "image", asset: { _type: "reference", _ref: coverAsset._id } },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to create book:", err);
    return NextResponse.json({ error: "Could not save the book. Please try again." }, { status: 500 });
  }
}
