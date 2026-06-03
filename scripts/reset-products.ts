import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function deleteIfModelExists(modelName: string, deleteMany: () => Promise<unknown>) {
  try {
    await deleteMany()
  } catch (error: any) {
    if (error?.code === "P2021") {
      console.warn(`Skipping ${modelName}: table does not exist in this database.`)
      return
    }
    throw error
  }
}

async function main() {
  const before = {
    products: await prisma.product.count(),
    productImages: await prisma.productImage.count(),
    productVariants: await prisma.productVariant.count(),
    orderItems: await prisma.orderItem.count(),
  }

  await prisma.$transaction(async (tx) => {
    await tx.orderItem.updateMany({
      data: {
        productId: null,
        variantId: null,
      },
    })
    await deleteIfModelExists("ReturnRequest", () => tx.returnRequest.updateMany({ data: { productId: null } }))

    await deleteIfModelExists("RecentlyViewed", () => tx.recentlyViewed.deleteMany())
    await deleteIfModelExists("ProductMedia", () => tx.productMedia.deleteMany())
    await tx.productImage.deleteMany()
    await tx.cartItem.deleteMany()
    await tx.wishlistItem.deleteMany()
    await tx.review.deleteMany()
    await tx.productVariant.deleteMany()
    await tx.product.deleteMany()
  })

  const after = {
    products: await prisma.product.count(),
    productImages: await prisma.productImage.count(),
    productVariants: await prisma.productVariant.count(),
    orderItems: await prisma.orderItem.count(),
  }

  console.log(JSON.stringify({ before, after }, null, 2))
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
