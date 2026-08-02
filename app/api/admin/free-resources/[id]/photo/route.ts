import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminRequestAuthenticated } from "@/lib/admin-session";
import { sanityWriteClient } from "@/lib/sanity/client";

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

type Props = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: Props) {
  if (!(await isAdminRequestAuthenticated())) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  if (!sanityWriteClient) {
    return NextResponse.json(
      { error: "SANITY_API_TOKEN is not configured." },
      { status: 503 }
    );
  }

  const { id } = await params;
  const form = await request.formData().catch(() => null);
  const photo = form?.get("photo");

  if (!(photo instanceof File) || photo.size === 0) {
    return NextResponse.json({ error: "Please choose a photo." }, { status: 400 });
  }
  if (photo.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Photo is too large (max 4MB)." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await photo.arrayBuffer());
    const asset = await sanityWriteClient.assets.upload("image", buffer, {
      filename: photo.name,
      contentType: photo.type || "image/jpeg",
    });

    await sanityWriteClient
      .patch(id)
      .set({ image: { _type: "image", asset: { _type: "reference", _ref: asset._id } } })
      .commit();

    revalidatePath("/resources");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to update free resource photo:", err);
    return NextResponse.json(
      { error: "Could not save the photo. Please try again." },
      { status: 500 }
    );
  }
}
