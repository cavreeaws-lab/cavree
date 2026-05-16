import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { getS3Client } from "@/lib/s3"
import { validate, fileUploadSchema } from "@/lib/validators"

export const dynamic = "force-dynamic"

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
]

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".pdf"]

export async function POST(request: NextRequest) {
  try {
    await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const body = await request.json()
    const validation = validate(fileUploadSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const { filename, contentType } = validation.data

    const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: `File type .${ext} not allowed` }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json({ error: `Content type ${contentType} not allowed` }, { status: 400 })
    }

    const bucketName = process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME
    if (!bucketName) {
      return NextResponse.json({ error: "S3 bucket not configured" }, { status: 500 })
    }

    const cloudfrontUrl = process.env.CLOUDFRONT_URL || process.env.CLOUDFRONT_DOMAIN
    if (!cloudfrontUrl) {
      return NextResponse.json({ error: "CDN not configured" }, { status: 500 })
    }

    const key = `uploads/${Date.now()}-${filename}`
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    })
    const signedUrl = await getSignedUrl(getS3Client(), command, { expiresIn: 300 })
    return NextResponse.json({ signedUrl, url: `${cloudfrontUrl}/${key}` })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
