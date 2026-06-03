import { readFileSync } from "node:fs"
import path from "node:path"
import { PrismaClient } from "@prisma/client"

const ROOT_DIR = path.resolve(__dirname, "..")
const EXTENDED_SIZES = ["3XL", "4XL", "5XL"] as const
const DEFAULT_QUANTITY = Number(process.env.CAVREE_EXTENDED_SIZE_QUANTITY || "3")
const dryRun = process.argv.includes("--dry-run")

function loadEnvFiles() {
  for (const fileName of [".env", ".env.local"]) {
    try {
      const content = readFileSync(path.join(ROOT_DIR, fileName), "utf8")
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue
        const [key, ...rest] = trimmed.split("=")
        if (process.env[key]) continue
        process.env[key] = rest.join("=").replace(/^['"]|['"]$/g, "")
      }
    } catch {
      // Optional env file.
    }
  }
}

loadEnvFiles()

const prisma = new PrismaClient()

async function main() {
  if (!Number.isInteger(DEFAULT_QUANTITY) || DEFAULT_QUANTITY < 0) {
    throw new Error("CAVREE_EXTENDED_SIZE_QUANTITY must be a non-negative integer")
  }

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      category: { slug: "women" },
      variants: { some: {} },
    },
    include: {
      variants: true,
      category: { select: { slug: true } },
    },
    orderBy: { sku: "asc" },
  })

  let created = 0
  let updatedProducts = 0

  for (const product of products) {
    const existingSizes = new Set(product.variants.map((variant) => variant.size?.toUpperCase()).filter(Boolean))
    const missingSizes = EXTENDED_SIZES.filter((size) => !existingSizes.has(size))
    if (missingSizes.length === 0) continue

    updatedProducts += 1
    if (dryRun) {
      created += missingSizes.length
      continue
    }

    await prisma.$transaction(async (tx) => {
      for (const size of missingSizes) {
        await tx.productVariant.upsert({
          where: { sku: `${product.sku}-${size}` },
          update: {
            size,
          },
          create: {
            productId: product.id,
            size,
            sku: `${product.sku}-${size}`,
            quantity: DEFAULT_QUANTITY,
          },
        })
        created += 1
      }

      const variants = await tx.productVariant.findMany({
        where: { productId: product.id },
        select: { quantity: true },
      })
      await tx.product.update({
        where: { id: product.id },
        data: {
          quantity: variants.reduce((total, variant) => total + variant.quantity, 0),
        },
      })
    })
  }

  console.log(JSON.stringify({
    dryRun,
    productsChecked: products.length,
    productsUpdated: updatedProducts,
    variantsCreated: created,
    addedSizes: EXTENDED_SIZES,
    quantityPerNewSize: DEFAULT_QUANTITY,
  }))
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
