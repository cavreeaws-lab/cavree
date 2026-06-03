import { createHash } from "crypto"
import { readFile, writeFile } from "fs/promises"
import path from "path"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import sharp from "sharp"

type CatalogItem = {
  folder: string
  name: string
  price: number
}

type Manifest = {
  version: 1
  assets: Record<string, { url: string; uploadedAt: string; source: string; size: number; contentType: string }>
}

type MediaInput = {
  type: "IMAGE" | "VIDEO"
  url: string
  posterUrl?: string
  alt: string
}

const ROOT = process.cwd()
const PRODUCTS_DIR = path.join(ROOT, "products")
const MANIFEST_PATH = path.join(PRODUCTS_DIR, ".organized-upload-manifest.json")
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"])
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm"])
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"]

const catalog: CatalogItem[] = [
  { folder: "Product-01", name: "Black Embroidered Kurta Dupatta Set", price: 2799 },
  { folder: "Product-02", name: "White Floral Dupatta Suit Set", price: 2499 },
  { folder: "Product-03", name: "White Printed Dupatta Suit Set", price: 2499 },
  { folder: "Product-04", name: "White Floral Kurta Suit Set", price: 2499 },
  { folder: "Product-05", name: "Yellow Embroidered Dupatta Suit Set", price: 2499 },
  { folder: "Product-06", name: "Maroon Festive Suit Set", price: 2799 },
  { folder: "Product-07", name: "Rust Red Ethnic Suit Set", price: 2799 },
  { folder: "Product-08", name: "Mustard Yellow Dupatta Suit Set", price: 2499 },
  { folder: "Product-09", name: "Rust Orange Suit Set", price: 2499 },
  { folder: "Product-010", name: "Red Anarkali Gown Set", price: 3999 },
  { folder: "Product-011", name: "Emerald Green Embroidered Suit Set", price: 2999 },
  { folder: "Product-012", name: "Mustard Straight Kurta Dupatta Set", price: 2499 },
  { folder: "Product-013", name: "Sage Green Embroidered Suit Set", price: 2999 },
  { folder: "Product-014", name: "Lavender Embellished Suit Set", price: 3299 },
  { folder: "Product-015", name: "Navy Embroidered Dupatta Suit Set", price: 2999 },
  { folder: "Product-016", name: "Deep Purple Ethnic Suit Set", price: 2799 },
  { folder: "Product-017", name: "Wine Red Embroidered Suit Set", price: 2999 },
  { folder: "Product-018", name: "Blush Pink Layered Suit Set", price: 2999 },
  { folder: "Product-019", name: "Ivory Embroidered Suit Set", price: 2999 },
  { folder: "Product-020", name: "Ivory Festive Kurta Suit Set", price: 2799 },
  { folder: "Product-021", name: "Ivory Patterned Dupatta Suit Set", price: 2999 },
  { folder: "Product-022", name: "Blush Pink Embroidered Suit Set", price: 2999 },
  { folder: "Product-023", name: "Ivory Striped Dupatta Suit Set", price: 2999 },
  { folder: "Product-024", name: "Aqua Embellished Sharara Set", price: 3499 },
  { folder: "Product-025", name: "Lime Green Festive Suit Set", price: 2999 },
  { folder: "Product-026", name: "Rose Pink Embroidered Suit Set", price: 2999 },
  { folder: "Product-027", name: "Yellow Floral Embroidered Suit Set", price: 2999 },
]

const args = new Set(process.argv.slice(2))
const dryRun = args.has("--dry-run")
const directS3Fallback = process.env.CAVREE_IMPORT_DIRECT_S3_FALLBACK === "true"
const baseUrl = stripTrailingSlash(getArg("--base-url") || process.env.CAVREE_IMPORT_BASE_URL || "http://localhost:3000")
const email = getArg("--email") || process.env.CAVREE_IMPORT_EMAIL
const password = getArg("--password") || process.env.CAVREE_IMPORT_PASSWORD

function getArg(name: string) {
  const prefix = `${name}=`
  return process.argv.slice(2).find((arg) => arg.startsWith(prefix))?.slice(prefix.length)
}

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, "")
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
}

function naturalImageSort(a: string, b: string) {
  return imageNumber(a) - imageNumber(b) || a.localeCompare(b)
}

function imageNumber(file: string) {
  const match = path.basename(file).match(/\((\d+)\)/)
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER
}

function productNumber(folder: string) {
  const match = folder.match(/Product-0*(\d+)/)
  if (!match) throw new Error(`Invalid product folder: ${folder}`)
  return Number(match[1])
}

function colorStyle(name: string) {
  return name
    .replace(/\b(Set|Suit|Kurta|Dupatta|Gown|Anarkali|Sharara|Ethnic|Festive|Embroidered|Embellished|Layered|Straight|Patterned|Printed|Floral)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
}

async function listMedia(folder: string) {
  const dir = path.join(PRODUCTS_DIR, folder)
  const entries = await import("fs/promises").then((fs) => fs.readdir(dir))
  const images = entries
    .filter((entry) => IMAGE_EXTENSIONS.has(path.extname(entry).toLowerCase()))
    .sort(naturalImageSort)
    .map((entry) => path.join(dir, entry))
  const videos = entries
    .filter((entry) => VIDEO_EXTENSIONS.has(path.extname(entry).toLowerCase()))
    .sort()
    .map((entry) => path.join(dir, entry))
  return { images, videos }
}

async function hashFile(filePath: string) {
  const buffer = await readFile(filePath)
  return createHash("sha256").update(buffer).digest("hex")
}

async function optimizeImage(filePath: string) {
  const input = await readFile(filePath)
  return sharp(input)
    .rotate()
    .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer()
}

async function loadManifest(): Promise<Manifest> {
  try {
    return JSON.parse(await readFile(MANIFEST_PATH, "utf8"))
  } catch {
    return { version: 1, assets: {} }
  }
}

async function saveManifest(manifest: Manifest) {
  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`)
}

class ApiClient {
  private cookie = ""

  constructor(private readonly origin: string) {}

  async login(loginEmail: string, loginPassword: string) {
    const response = await fetch(`${this.origin}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: loginEmail, password: loginPassword }),
    })
    this.captureCookies(response)
    if (!response.ok) {
      throw new Error(`Login failed: ${response.status} ${await response.text()}`)
    }
    return response.json() as Promise<{ user: { role: string } }>
  }

  async json<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.origin}${url}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
        ...(this.cookie ? { Cookie: this.cookie } : {}),
      },
    })
    this.captureCookies(response)
    if (!response.ok) {
      throw new Error(`${init?.method || "GET"} ${url} failed: ${response.status} ${await response.text()}`)
    }
    return response.json() as Promise<T>
  }

  private captureCookies(response: Response) {
    const setCookie = response.headers.get("set-cookie")
    if (!setCookie) return
    const cookieParts = setCookie
      .split(/,(?=[^;,]+=)/)
      .map((cookie) => cookie.split(";")[0])
      .filter(Boolean)
    this.cookie = mergeCookies(this.cookie, cookieParts)
  }
}

function mergeCookies(existing: string, next: string[]) {
  const map = new Map<string, string>()
  existing.split(";").map((part) => part.trim()).filter(Boolean).forEach((part) => {
    const [key] = part.split("=")
    map.set(key, part)
  })
  next.forEach((part) => {
    const [key] = part.split("=")
    map.set(key, part)
  })
  return Array.from(map.values()).join("; ")
}

async function uploadAsset(
  client: ApiClient,
  manifest: Manifest,
  filePath: string,
  contentType: string,
  outputName: string,
  buffer: Buffer
) {
  const sourceHash = await hashFile(filePath)
  const key = `${sourceHash}:${contentType}:1800w-q82:${outputName}`
  const cached = manifest.assets[key]
  if (cached?.url) return cached.url

  const upload = await client.json<{ signedUrl: string; url: string }>("/api/upload", {
    method: "POST",
    body: JSON.stringify({ filename: outputName, contentType, size: buffer.length }),
  })
  const putResponse = await fetch(upload.signedUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: new Uint8Array(buffer),
  })
  if (!putResponse.ok) {
    if (!directS3Fallback) {
      throw new Error(`S3 upload failed for ${filePath}: ${putResponse.status} ${await putResponse.text()}`)
    }
    await directUpload(upload.signedUrl, contentType, buffer)
  }
  manifest.assets[key] = {
    url: upload.url,
    uploadedAt: new Date().toISOString(),
    source: path.relative(ROOT, filePath),
    size: buffer.length,
    contentType,
  }
  await saveManifest(manifest)
  return upload.url
}

async function directUpload(signedUrl: string, contentType: string, buffer: Buffer) {
  const parsed = new URL(signedUrl)
  const hostMatch = parsed.hostname.match(/^(.+)\.s3[.-]/)
  const bucket = process.env.CAVREE_IMPORT_S3_BUCKET || hostMatch?.[1]
  const key = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""))
  if (!bucket || !key) {
    throw new Error("Cannot derive S3 bucket/key for direct upload fallback.")
  }
  const s3 = new S3Client({ region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "ap-south-1" })
  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }))
}

async function findExistingProduct(client: ApiClient, sku: string) {
  const data = await client.json<{ products: Array<{ id: string; sku: string }> }>(`/api/admin/products?search=${encodeURIComponent(sku)}&limit=50`)
  return data.products.find((product) => product.sku === sku)
}

async function main() {
  let totalImages = 0
  let totalVideos = 0
  let largestOptimized = 0
  const scanned: Array<{ item: CatalogItem; images: string[]; videos: string[] }> = []

  for (const item of catalog) {
    const media = await listMedia(item.folder)
    if (media.images.length === 0) throw new Error(`${item.folder} has no images`)
    if (item.folder !== "Product-023" && media.videos.length > 0) throw new Error(`Unexpected video in ${item.folder}`)
    totalImages += media.images.length
    totalVideos += media.videos.length
    scanned.push({ item, images: media.images, videos: media.videos })
  }

  for (const entry of scanned) {
    for (const image of entry.images) {
      const buffer = await optimizeImage(image)
      largestOptimized = Math.max(largestOptimized, buffer.length)
      if (buffer.length > 10 * 1024 * 1024) {
        throw new Error(`Optimized image exceeds 10MB: ${image}`)
      }
    }
  }

  console.log(`Dry scan: ${scanned.length} products, ${totalImages} images, ${totalVideos} videos, largest optimized image ${(largestOptimized / 1024 / 1024).toFixed(2)}MB`)

  if (dryRun) return
  if (!email || !password) {
    throw new Error("Set CAVREE_IMPORT_EMAIL and CAVREE_IMPORT_PASSWORD, or pass --email/--password.")
  }

  const client = new ApiClient(baseUrl)
  const login = await client.login(email, password)
  const categories = await client.json<{ categories: Array<{ id: string; slug: string; name: string }> }>("/api/admin/categories")
  const women = categories.categories.find((category) => category.slug === "women" || category.name.toLowerCase() === "women")
  if (!women) throw new Error("Women category not found")
  let franchiseId = process.env.CAVREE_IMPORT_FRANCHISE_ID
  if (!franchiseId && login.user.role === "SUPER_ADMIN") {
    const franchises = await client.json<{ franchises: Array<{ id: string; slug: string; isActive: boolean }> }>("/api/super-admin/franchises?status=active&limit=50")
    franchiseId = franchises.franchises.find((franchise) => franchise.slug === "fashion-hub-mumbai")?.id || franchises.franchises[0]?.id
  }
  if (!franchiseId && login.user.role !== "FRANCHISEE") {
    throw new Error("No franchise available. Set CAVREE_IMPORT_FRANCHISE_ID or use a franchise-scoped login.")
  }

  const manifest = await loadManifest()
  let created = 0
  let updated = 0

  for (const entry of scanned) {
    const number = productNumber(entry.item.folder)
    const padded = String(number).padStart(3, "0")
    const sku = `CAV-WOM-${padded}`
    const modelNumber = `1001-${padded}`
    const slug = `${slugify(entry.item.name)}-${padded}`
    const compareAtPrice = entry.item.price + (entry.item.price < 3000 ? 1000 : 1500)
    const media: MediaInput[] = []

    for (let index = 0; index < entry.images.length; index += 1) {
      const image = entry.images[index]
      const buffer = await optimizeImage(image)
      const url = await uploadAsset(client, manifest, image, "image/webp", `${slug}-${index + 1}.webp`, buffer)
      media.push({ type: "IMAGE", url, alt: `${entry.item.name} view ${index + 1}` })
    }

    if (entry.videos.length > 0) {
      const videoPath = entry.videos[0]
      const videoBuffer = await readFile(videoPath)
      if (videoBuffer.length > 100 * 1024 * 1024) throw new Error(`Video exceeds 100MB: ${videoPath}`)
      const videoUrl = await uploadAsset(client, manifest, videoPath, "video/mp4", `${slug}-video.mp4`, videoBuffer)
      media.push({ type: "VIDEO", url: videoUrl, posterUrl: media[0]?.url, alt: `${entry.item.name} video` })
    }

    const payload = {
      name: entry.item.name,
      slug,
      description: `A Cavree women's ethnic set in ${colorStyle(entry.item.name)}, styled with a matching dupatta and refined detailing for festive, occasion, and elevated everyday wear.`,
      modelNumber,
      brand: "Cavree",
      sku,
      price: entry.item.price,
      compareAtPrice,
      quantity: SIZES.length * 3,
      categoryId: women.id,
      franchiseId,
      tags: ["women", "ethnic wear", "suit set", "dupatta"],
      isActive: true,
      isFeatured: number <= 4,
      isNew: true,
      trackQuantity: true,
      allowBackorders: false,
      lowStockThreshold: 5,
      metaTitle: `${entry.item.name} | Cavree`,
      metaDescription: `Shop ${entry.item.name} from Cavree's women's ethnic collection.`,
      media,
      images: media.filter((asset) => asset.type === "IMAGE").map((asset) => ({ url: asset.url, alt: asset.alt })),
      variants: SIZES.map((size) => ({
        size,
        sku: `${sku}-${size}`,
        quantity: 3,
      })),
    }

    const existing = await findExistingProduct(client, sku)
    if (existing) {
      await client.json(`/api/admin/products/${existing.id}`, { method: "PUT", body: JSON.stringify(payload) })
      updated += 1
      console.log(`Updated ${sku} (${media.length} media)`)
    } else {
      await client.json("/api/admin/products", { method: "POST", body: JSON.stringify(payload) })
      created += 1
      console.log(`Created ${sku} (${media.length} media)`)
    }
  }

  console.log(`Done: created ${created}, updated ${updated}, total ${catalog.length}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
