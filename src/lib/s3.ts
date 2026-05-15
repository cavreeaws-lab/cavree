import { S3Client } from "@aws-sdk/client-s3"

let _s3Client: S3Client | null = null

function getS3Config() {
  const region = process.env.AWS_REGION || "ap-south-1"
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are required")
  }

  return { region, credentials: { accessKeyId, secretAccessKey } }
}

export function getS3Client(): S3Client {
  if (!_s3Client) {
    _s3Client = new S3Client(getS3Config())
  }
  return _s3Client
}

export function getBucketName(): string {
  const bucket = process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME
  if (!bucket) {
    throw new Error("S3_BUCKET_NAME or AWS_S3_BUCKET_NAME environment variable is required")
  }
  return bucket
}
