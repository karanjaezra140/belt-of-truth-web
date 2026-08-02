import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminRequestAuthenticated } from "@/lib/admin-session";
import { sanityWriteClient } from "@/lib/sanity/client";

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const SINGLE_IMAGE_FIELDS = ["missionVisionPhoto", "contactHeroPhoto"] as const;

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

  const heroImage = form.get("heroImage");
  const providedSingles = SINGLE_IMAGE_FIELDS.filter((f) => form.get(f) instanceof File);

  if (!(heroImage instanceof File) && providedSingles.length === 0) {
    return NextResponse.json({ error: "Please choose a photo to upload." }, { status: 400 });
  }

  for (const file of [heroImage, ...providedSingles.map((f) => form.get(f))]) {
    if (file instanceof File && file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: `"${file.name}" is too large (max 4MB).` },
        { status: 400 }
      );
    }
  }

  try {
    await sanityWriteClient.createIfNotExists({ _id: "siteSettings", _type: "siteSettings" });
    let patch = sanityWriteClient.patch("siteSettings");

    if (heroImage instanceof File && heroImage.size > 0) {
      const buffer = Buffer.from(await heroImage.arrayBuffer());
      const asset = await sanityWriteClient.assets.upload("image", buffer, {
        filename: heroImage.name,
        contentType: heroImage.type || "image/jpeg",
      });
      patch = patch.setIfMissing({ heroImages: [] }).append("heroImages", [
        {
          _type: "image",
          _key: randomUUID(),
          asset: { _type: "reference", _ref: asset._id },
        },
      ]);
    }

    for (const field of providedSingles) {
      const file = form.get(field) as File;
      const buffer = Buffer.from(await file.arrayBuffer());
      const asset = await sanityWriteClient.assets.upload("image", buffer, {
        filename: file.name,
        contentType: file.type || "image/jpeg",
      });
      patch = patch.set({
        [field]: { _type: "image", asset: { _type: "reference", _ref: asset._id } },
      });
    }

    await patch.commit();
    // These pages are statically prerendered — without this, the upload
    // would succeed but not actually appear until the next deploy.
    revalidatePath("/");
    revalidatePath("/contact");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to update site media:", err);
    return NextResponse.json(
      { error: "Could not save the photo. Please try again." },
      { status: 500 }
    );
  }
}
