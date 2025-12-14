import { NextRequest, NextResponse } from "next/server";

const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export async function POST(req: NextRequest) {
  try {
    const { publicId } = await req.json();

    if (!publicId || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
      return NextResponse.json(
        { error: "Missing required configuration" },
        { status: 400 }
      );
    }

    // Create timestamp for authentication
    const timestamp = Math.floor(Date.now() / 1000);

    // Create signature for Cloudinary API
    const crypto = require("crypto");
    const toSign = `public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    const signature = crypto.createHash("sha1").update(toSign).digest("hex");

    // Delete file from Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          public_id: publicId,
          api_key: CLOUDINARY_API_KEY,
          timestamp: timestamp.toString(),
          signature,
        }).toString(),
      }
    );

    if (!response.ok) {
      throw new Error("Cloudinary delete failed");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Delete avatar error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete avatar" },
      { status: 500 }
    );
  }
}
