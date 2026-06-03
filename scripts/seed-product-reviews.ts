import { readFileSync } from "node:fs"
import path from "node:path"
import { PrismaClient } from "@prisma/client"

const ROOT_DIR = path.resolve(__dirname, "..")
const dryRun = process.argv.includes("--dry-run")

const reviewCustomers = [
  {
    name: "M Manju",
    comment: "The fabric feels soft and premium. The fit and finishing are very good for occasion wear.",
  },
  {
    name: "Yalaka Sarika",
    comment: "Beautiful design and comfortable to wear. The dupatta detailing looks elegant in person.",
  },
  {
    name: "S Parvathi",
    comment: "Good quality stitching and the color looks exactly like the pictures. Happy with the purchase.",
  },
  {
    name: "V Lakshmi",
    comment: "The material and embroidery are neat. It is a graceful outfit for festivals and family functions.",
  },
]

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

function reviewCustomerEmail(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/(^\.|\.$)/g, "")
  return `review.${slug || "customer"}@cavree.local`
}

loadEnvFiles()

const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      category: { slug: "women" },
    },
    select: { id: true, name: true, sku: true },
    orderBy: { sku: "asc" },
    take: reviewCustomers.length,
  })

  if (products.length < reviewCustomers.length) {
    throw new Error(`Expected at least ${reviewCustomers.length} active women products, found ${products.length}`)
  }

  let created = 0
  let updated = 0

  for (let index = 0; index < reviewCustomers.length; index += 1) {
    const customer = reviewCustomers[index]
    const product = products[index]
    const email = reviewCustomerEmail(customer.name)

    if (dryRun) continue

    const user = await prisma.user.upsert({
      where: { email },
      update: { name: customer.name, role: "CUSTOMER" },
      create: { email, name: customer.name, role: "CUSTOMER" },
    })

    const existing = await prisma.review.findFirst({
      where: { productId: product.id, userId: user.id },
      select: { id: true },
    })

    if (existing) {
      await prisma.review.update({
        where: { id: existing.id },
        data: {
          rating: 5,
          comment: customer.comment,
          isApproved: true,
        },
      })
      updated += 1
    } else {
      await prisma.review.create({
        data: {
          productId: product.id,
          userId: user.id,
          rating: 5,
          comment: customer.comment,
          isApproved: true,
        },
      })
      created += 1
    }
  }

  console.log(JSON.stringify({
    dryRun,
    targetProducts: products.map((product) => product.name),
    reviewCustomers: reviewCustomers.map((customer) => customer.name),
    created: dryRun ? reviewCustomers.length : created,
    updated,
  }, null, 2))
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
