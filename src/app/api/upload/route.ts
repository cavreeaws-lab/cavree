import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { getS3Client } from "@/lib/s3"
import { validate, fileUploadSchema } from "@/lib/validators"
import { randomUUID } from "crypto"

export const dynamic = "force-dynamic"

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
]

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".webm"]
const IMAGE_MAX_SIZE = 10 * 1024 * 1024
const VIDEO_MAX_SIZE = 100 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const body = await request.json()
    const validation = validate(fileUploadSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const { filename, contentType, size } = validation.data

    const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase()
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: `File extension ${ext || "(none)"} is not allowed. Use JPG, PNG, WEBP, GIF, MP4, or WEBM.` }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json({ error: `Content type ${contentType || "(unknown)"} is not allowed. Use image files or MP4/WEBM videos.` }, { status: 400 })
    }
    const isVideo = contentType.startsWith("video/")
    const maxSize = isVideo ? VIDEO_MAX_SIZE : IMAGE_MAX_SIZE
    if (size > maxSize) {
      return NextResponse.json({ error: isVideo ? "Video must be under 100MB." : "Image must be under 10MB." }, { status: 400 })
    }

    const bucketName = process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME
    if (!bucketName) {
      return NextResponse.json({ error: "Upload storage is not configured. Missing S3 bucket." }, { status: 500 })
    }

    const cloudfrontUrl = process.env.CLOUDFRONT_URL || process.env.CLOUDFRONT_DOMAIN
    if (!cloudfrontUrl) {
      return NextResponse.json({ error: "Upload CDN is not configured." }, { status: 500 })
    }

    const safeName = filename
      .replace(/[/\\?%*:|"<>]/g, "-")
      .replace(/\s+/g, "-")
      .toLowerCase()
    const key = `${isVideo ? "uploads/videos" : "uploads/images"}/${Date.now()}-${randomUUID()}-${safeName}`
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    })
    const signedUrl = await getSignedUrl(getS3Client(), command, { expiresIn: 300 })
    return NextResponse.json({ signedUrl, url: `${cloudfrontUrl}/${key}`, type: isVideo ? "VIDEO" : "IMAGE" })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
