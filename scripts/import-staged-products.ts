import { PrismaClient } from "@prisma/client"
import { readFileSync } from "node:fs"
import fs from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const ROOT_DIR = path.resolve(__dirname, "..")
const STAGING_DIR = path.join(ROOT_DIR, "products", "products-organized", "_staging")
const OUTPUT_DIR = path.join(ROOT_DIR, "public", "images", "products")
const REVIEW_LIST_PATH = path.join(ROOT_DIR, "products", "products-organized", "single-image-review.json")
const IMPORT_PREFIX = "cavree-womens-ethnic-set"
const SKU_PREFIX = "CAV-WOM"
const MAX_IMAGES_PER_PRODUCT = 3
const FEATURED_LIMIT = 8
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"] as const
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"])
const PREPARE_ASSETS_ONLY = process.argv.includes("--prepare-assets-only")
const USE_EXISTING_ASSETS = process.argv.includes("--use-existing-assets")

const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" })

function loadEnvFiles() {
  const envFiles = [".env", ".env.local"]

  for (const fileName of envFiles) {
    const filePath = path.join(ROOT_DIR, fileName)
    let content = ""

    try {
      content = readFileSync(filePath, "utf8")
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error
      }
      continue
    }

    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) {
        continue
      }

      const separatorIndex = trimmed.indexOf("=")
      if (separatorIndex === -1) {
        continue
      }

      const key = trimmed.slice(0, separatorIndex).trim()
      const value = trimmed
        .slice(separatorIndex + 1)
        .trim()
        .replace(/^["']|["']$/g, "")

      if (!(key in process.env)) {
        process.env[key] = value
      }
    }
  }
}

loadEnvFiles()

const prisma = new PrismaClient()

type ProductGroup = {
  folderName: string
  folderPath: string
  images: string[]
  sequence: number
  useExistingAssets?: boolean
}

function sequenceFromFolder(folderName: string) {
  const match = folderName.match(/(\d+)$/)
  if (!match) {
    throw new Error(`Cannot derive product sequence from folder: ${folderName}`)
  }

  return Number(match[1])
}

function productSlug(sequence: number) {
  return `${IMPORT_PREFIX}-${String(sequence).padStart(3, "0")}`
}

function productSku(sequence: number) {
  return `${SKU_PREFIX}-${String(sequence).padStart(3, "0")}`
}

function titleFor(sequence: number) {
  const names = [
    "Printed Kurta Set",
    "Embroidered Ethnic Set",
    "Festive Anarkali Set",
    "Cotton Kurta Co-ord",
    "Designer Salwar Set",
    "Chanderi Style Suit Set",
    "Floral Daywear Set",
    "Occasion Wear Kurta Set",
  ]

  return `Cavree ${names[(sequence - 1) % names.length]} ${String(sequence).padStart(3, "0")}`
}

function priceFor(sequence: number) {
  const prices = [3499, 3999, 4499, 4999, 5499, 5999, 6499, 6999]
  return prices[(sequence - 1) % prices.length]
}

async function listImageFiles(folderPath: string) {
  const entries = await fs.readdir(folderPath, { withFileTypes: true })

  return entries
    .filter((entry) => entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => path.join(folderPath, entry.name))
    .sort((a, b) => collator.compare(path.basename(a), path.basename(b)))
}

async function loadProductGroups() {
  const entries = await fs.readdir(STAGING_DIR, { withFileTypes: true })
  const folders = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("product-"))
    .map((entry) => entry.name)
    .sort((a, b) => collator.compare(a, b))

  const eligible: ProductGroup[] = []
  const singleImageReview: Array<{ folderName: string; imageCount: number; images: string[] }> = []

  for (const folderName of folders) {
    const folderPath = path.join(STAGING_DIR, folderName)
    const images = await listImageFiles(folderPath)

    if (images.length >= 2) {
      eligible.push({
        folderName,
        folderPath,
        images,
        sequence: sequenceFromFolder(folderName),
      })
      continue
    }

    singleImageReview.push({
      folderName,
      imageCount: images.length,
      images: images.map((imagePath) => path.relative(ROOT_DIR, imagePath)),
    })
  }

  return { eligible, singleImageReview }
}

async function loadExistingAssetGroups() {
  const entries = await fs.readdir(OUTPUT_DIR, { withFileTypes: true })
  const groups = new Map<number, string[]>()
  const pattern = new RegExp(`^${IMPORT_PREFIX}-(\\d{3})-\\d+\\.jpg$`)

  for (const entry of entries) {
    if (!entry.isFile()) {
      continue
    }

    const match = entry.name.match(pattern)
    if (!match) {
      continue
    }

    const sequence = Number(match[1])
    const images = groups.get(sequence) ?? []
    images.push(path.join(OUTPUT_DIR, entry.name))
    groups.set(sequence, images)
  }

  const eligible = Array.from(groups.entries())
    .map(([sequence, images]) => ({
      folderName: `existing-assets-${String(sequence).padStart(3, "0")}`,
      folderPath: OUTPUT_DIR,
      images: images.sort((a, b) => collator.compare(path.basename(a), path.basename(b))),
      sequence,
      useExistingAssets: true,
    }))
    .filter((group) => group.images.length >= 2)
    .sort((a, b) => a.sequence - b.sequence)

  return { eligible, singleImageReview: [] }
}

async function writeReviewList(singleImageReview: Array<{ folderName: string; imageCount: number; images: string[] }>) {
  await fs.mkdir(path.dirname(REVIEW_LIST_PATH), { recursive: true })
  await fs.writeFile(
    REVIEW_LIST_PATH,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        reason: "Folders with fewer than 2 images are excluded from the Cavree product import.",
        count: singleImageReview.length,
        folders: singleImageReview,
      },
      null,
      2,
    )}\n`,
  )
}

async function optimizeImages(group: ProductGroup, slug: string, productName: string) {
  if (group.useExistingAssets) {
    return group.images.slice(0, MAX_IMAGES_PER_PRODUCT).map((imagePath, index) => ({
      url: `/images/products/${path.basename(imagePath)}`,
      alt: `${productName} view ${index + 1}`,
      sortOrder: index,
    }))
  }

  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  const selectedImages = group.images.slice(0, MAX_IMAGES_PER_PRODUCT)
  const imageRecords = []

  for (let index = 0; index < selectedImages.length; index += 1) {
    const sourcePath = selectedImages[index]
    const outputFileName = `${slug}-${index + 1}.jpg`
    const outputPath = path.join(OUTPUT_DIR, outputFileName)

    await sharp(sourcePath)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(outputPath)

    imageRecords.push({
      url: `/images/products/${outputFileName}`,
      alt: `${productName} view ${index + 1}`,
      sortOrder: index,
    })
  }

  return imageRecords
}

async function findImportFranchise() {
  const preferred = await prisma.franchise.findUnique({
    where: { slug: "fashion-hub-mumbai" },
  })

  if (preferred?.isActive && preferred.isApproved) {
    return preferred
  }

  const fallback = await prisma.franchise.findFirst({
    where: {
      isActive: true,
      isApproved: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  })

  if (!fallback) {
    throw new Error("No active approved franchise found. Create or approve a franchise before importing products.")
  }

  return fallback
}

async function ensureWomenCategory() {
  return prisma.category.upsert({
    where: { slug: "women" },
    update: {
      name: "Women",
      isActive: true,
    },
    create: {
      name: "Women",
      slug: "women",
      description: "Women's fashion collection",
      isActive: true,
    },
  })
}

async function importProduct(group: ProductGroup, categoryId: string, franchiseId: string, productIndex: number) {
  const slug = productSlug(group.sequence)
  const sku = productSku(group.sequence)
  const name = titleFor(group.sequence)
  const price = priceFor(group.sequence)
  const comparePrice = Math.round(price * 1.28)
  const quantity = 48
  const images = await optimizeImages(group, slug, name)

  await prisma.$transaction(async (tx) => {
    const product = await tx.product.upsert({
      where: { slug },
      update: {
        name,
        description:
          "A curated Cavree women's ethnicwear piece selected from the latest catalog shoot. Designed for festive occasions, day events, and elevated everyday styling.",
        sku,
        brand: "Cavree",
        price,
        comparePrice,
        quantity,
        isActive: true,
        isFeatured: productIndex < FEATURED_LIMIT,
        isNew: true,
        tags: ["women", "ethnic wear", "kurta set", "new arrival"],
        metaTitle: `${name} | Cavree`,
        metaDescription: `${name} with multiple product views, available in standard Cavree sizes.`,
        categoryId,
        franchiseId,
        trackQuantity: true,
        allowBackorders: false,
        lowStockThreshold: 5,
      },
      create: {
        name,
        slug,
        description:
          "A curated Cavree women's ethnicwear piece selected from the latest catalog shoot. Designed for festive occasions, day events, and elevated everyday styling.",
        sku,
        brand: "Cavree",
        price,
        comparePrice,
        quantity,
        isActive: true,
        isFeatured: productIndex < FEATURED_LIMIT,
        isNew: true,
        tags: ["women", "ethnic wear", "kurta set", "new arrival"],
        metaTitle: `${name} | Cavree`,
        metaDescription: `${name} with multiple product views, available in standard Cavree sizes.`,
        categoryId,
        franchiseId,
        trackQuantity: true,
        allowBackorders: false,
        lowStockThreshold: 5,
      },
    })

    await tx.productImage.deleteMany({
      where: {
        productId: product.id,
      },
    })

    await tx.productImage.createMany({
      data: images.map((image) => ({
        ...image,
        productId: product.id,
      })),
    })

    for (let index = 0; index < SIZES.length; index += 1) {
      const size = SIZES[index]

      await tx.productVariant.upsert({
        where: {
          sku: `${sku}-${size}`,
        },
        update: {
          size,
          color: "Assorted",
          price,
          quantity: 12,
          productId: product.id,
        },
        create: {
          size,
          color: "Assorted",
          sku: `${sku}-${size}`,
          price,
          quantity: 12,
          productId: product.id,
        },
      })
    }
  })

  return {
    slug,
    sku,
    name,
    imageCount: images.length,
  }
}

async function main() {
  const { eligible, singleImageReview } = USE_EXISTING_ASSETS ? await loadExistingAssetGroups() : await loadProductGroups()

  if (eligible.length !== 47) {
    throw new Error(`Expected 47 product folders with 2+ images, found ${eligible.length}. Review staging assets before importing.`)
  }

  if (!USE_EXISTING_ASSETS) {
    await writeReviewList(singleImageReview)
  }

  if (PREPARE_ASSETS_ONLY) {
    for (const group of eligible) {
      const slug = productSlug(group.sequence)
      const name = titleFor(group.sequence)
      const images = await optimizeImages(group, slug, name)
      console.log(`Prepared ${group.folderName} as ${slug} (${images.length} images)`)
    }

    console.log(`\nPrepared assets for ${eligible.length} products.`)
    console.log(`Excluded ${singleImageReview.length} single-image folders. Review list: ${path.relative(ROOT_DIR, REVIEW_LIST_PATH)}`)
    console.log(`Optimized product images written to ${path.relative(ROOT_DIR, OUTPUT_DIR)}`)
    return
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Add a local .env/.env.local or pass DATABASE_URL before running npm run import:products.")
  }

  const [category, franchise] = await Promise.all([ensureWomenCategory(), findImportFranchise()])
  const imported = []

  for (let index = 0; index < eligible.length; index += 1) {
    const group = eligible[index]

    imported.push(await importProduct(group, category.id, franchise.id, index))
    console.log(`Imported ${group.folderName} as ${imported[index].slug} (${imported[index].imageCount} images)`)
  }

  const importedSlugs = imported.map((product) => product.slug)
  const productsWithImages = await prisma.product.findMany({
    where: {
      slug: {
        in: importedSlugs,
      },
    },
    select: {
      slug: true,
      _count: {
        select: {
          images: true,
          variants: true,
        },
      },
    },
    orderBy: {
      slug: "asc",
    },
  })

  const productsMissingImages = productsWithImages.filter((product) => product._count.images < 2)
  const productsMissingVariants = productsWithImages.filter((product) => product._count.variants < SIZES.length)

  if (productsMissingImages.length > 0 || productsMissingVariants.length > 0) {
    throw new Error(
      `Import verification failed. Missing images: ${productsMissingImages.length}; missing variants: ${productsMissingVariants.length}`,
    )
  }

  console.log(`\nImported ${imported.length} products for franchise "${franchise.name}".`)
  console.log(`Excluded ${singleImageReview.length} single-image folders. Review list: ${path.relative(ROOT_DIR, REVIEW_LIST_PATH)}`)
  console.log(`Optimized product images written to ${path.relative(ROOT_DIR, OUTPUT_DIR)}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
