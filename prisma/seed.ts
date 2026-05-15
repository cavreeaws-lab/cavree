import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create categories
  const womenCategory = await prisma.category.create({
    data: {
      name: "Women",
      slug: "women",
      description: "Women's fashion collection",
    },
  })

  const menCategory = await prisma.category.create({
    data: {
      name: "Men",
      slug: "men",
      description: "Men's fashion collection",
    },
  })

  const accessoriesCategory = await prisma.category.create({
    data: {
      name: "Accessories",
      slug: "accessories",
      description: "Fashion accessories",
    },
  })

  // Create super admin
  const superAdminPassword = await bcrypt.hash("SuperAdmin123!", 12)
  const superAdmin = await prisma.user.create({
    data: {
      email: "superadmin@cavree.com",
      password: superAdminPassword,
      name: "Super Admin",
      phone: "+91 98765 43210",
      role: "SUPER_ADMIN",
    },
  })

  // Create franchisee
  const franchisePassword = await bcrypt.hash("Franchise123!", 12)
  const franchiseUser = await prisma.user.create({
    data: {
      email: "franchise@cavree.com",
      password: franchisePassword,
      name: "Fashion Hub Owner",
      phone: "+91 98765 43211",
      role: "FRANCHISEE",
    },
  })

  // Create franchise
  const franchise = await prisma.franchise.create({
    data: {
      name: "Fashion Hub Mumbai",
      slug: "fashion-hub-mumbai",
      description: "Premium fashion store in Mumbai",
      address: "123 Fashion Street, Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400050",
      phone: "+91 98765 43211",
      email: "franchise@cavree.com",
      commission: 10,
      isActive: true,
      isApproved: true,
      ownerId: franchiseUser.id,
    },
  })

  // Create customer
  const customerPassword = await bcrypt.hash("Customer123!", 12)
  const customer = await prisma.user.create({
    data: {
      email: "customer@example.com",
      password: customerPassword,
      name: "John Doe",
      phone: "+91 98765 43212",
      role: "CUSTOMER",
    },
  })

  // Create sample products
  const products = [
    {
      name: "Elegant Black Evening Dress",
      slug: "elegant-black-evening-dress",
      description: "A stunning black evening dress perfect for formal occasions. Made with premium fabric for maximum comfort and elegance.",
      sku: "DRS-001-BLK",
      price: 8999,
      comparePrice: 12999,
      quantity: 25,
      isActive: true,
      isFeatured: true,
      isNew: true,
      categoryId: womenCategory.id,
      franchiseId: franchise.id,
    },
    {
      name: "Classic White Summer Dress",
      slug: "classic-white-summer-dress",
      description: "Breathable white summer dress with floral embroidery. Perfect for beach parties and casual outings.",
      sku: "DRS-002-WHT",
      price: 5999,
      comparePrice: 7999,
      quantity: 30,
      isActive: true,
      isFeatured: true,
      isNew: false,
      categoryId: womenCategory.id,
      franchiseId: franchise.id,
    },
    {
      name: "Premium Linen Shirt",
      slug: "premium-linen-shirt",
      description: "High-quality linen shirt for men. Available in multiple colors and sizes.",
      sku: "SHT-001-LIN",
      price: 3499,
      comparePrice: 4999,
      quantity: 40,
      isActive: true,
      isFeatured: false,
      isNew: true,
      categoryId: menCategory.id,
      franchiseId: franchise.id,
    },
    {
      name: "Designer Leather Handbag",
      slug: "designer-leather-handbag",
      description: "Genuine leather handbag with gold-tone hardware. Spacious interior with multiple compartments.",
      sku: "BAG-001-LEA",
      price: 12499,
      comparePrice: 16999,
      quantity: 15,
      isActive: true,
      isFeatured: true,
      isNew: false,
      categoryId: accessoriesCategory.id,
      franchiseId: franchise.id,
    },
  ]

  for (const productData of products) {
    const product = await prisma.product.create({
      data: productData,
    })

    // Add product images
    await prisma.productImage.createMany({
      data: [
        {
          url: `/images/products/${product.slug}-1.jpg`,
          alt: product.name,
          sortOrder: 0,
          productId: product.id,
        },
        {
          url: `/images/products/${product.slug}-2.jpg`,
          alt: product.name,
          sortOrder: 1,
          productId: product.id,
        },
      ],
    })

    // Add variants for dresses
    if (productData.categoryId === womenCategory.id) {
      await prisma.productVariant.createMany({
        data: [
          { size: "S", color: "Black", sku: `${productData.sku}-S`, price: productData.price, quantity: 8, productId: product.id },
          { size: "M", color: "Black", sku: `${productData.sku}-M`, price: productData.price, quantity: 10, productId: product.id },
          { size: "L", color: "Black", sku: `${productData.sku}-L`, price: productData.price, quantity: 7, productId: product.id },
        ],
      })
    }
  }

  // Create coupons
  await prisma.coupon.create({
    data: {
      code: "WELCOME20",
      description: "20% off on your first order",
      type: "PERCENTAGE",
      value: 20,
      minOrder: 5000,
      maxDiscount: 5000,
      usageLimit: 100,
      startDate: new Date(),
      endDate: new Date("2024-12-31"),
      isActive: true,
    },
  })

  await prisma.coupon.create({
    data: {
      code: "FLAT500",
      description: "Flat ₹500 off on orders above ₹10000",
      type: "FIXED",
      value: 500,
      minOrder: 10000,
      startDate: new Date(),
      endDate: new Date("2024-12-31"),
      isActive: true,
    },
  })

  // Create settings
  const settings = [
    { key: "site_name", value: "Cavree", group: "GENERAL" },
    { key: "site_description", value: "Luxury Fashion Marketplace", group: "GENERAL" },
    { key: "contact_email", value: "support@cavree.com", group: "GENERAL" },
    { key: "contact_phone", value: "+91 1800-123-4567", group: "GENERAL" },
    { key: "shipping_threshold", value: "5000", group: "SHIPPING" },
    { key: "standard_shipping_cost", value: "150", group: "SHIPPING" },
    { key: "cod_enabled", value: "true", group: "PAYMENT" },
    { key: "razorpay_enabled", value: "true", group: "PAYMENT" },
  ]

  for (const setting of settings) {
    await prisma.setting.create({
      data: setting,
    })
  }

  console.log("Seed completed successfully!")
  console.log("\nLogin credentials:")
  console.log("Super Admin: superadmin@cavree.com / SuperAdmin123!")
  console.log("Franchise: franchise@cavree.com / Franchise123!")
  console.log("Customer: customer@example.com / Customer123!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
