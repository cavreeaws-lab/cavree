import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const homeHeroSlides = [
  {
    title: "Elevate Your Style",
    subtitle: "Discover the Latest Luxury Fashion Collections",
    ctaLabel: "Shop Now",
    image: "/images/hero-1.jpg",
    link: "/shop",
    position: "HOME_HERO",
    sortOrder: 0,
  },
  {
    title: "Timeless Elegance",
    subtitle: "Premium Dresses for Every Occasion",
    ctaLabel: "Explore",
    image: "/images/hero-2.jpg",
    link: "/shop?category=women",
    position: "HOME_HERO",
    sortOrder: 1,
  },
  {
    title: "New Arrivals",
    subtitle: "Be the First to Own the Season's Best",
    ctaLabel: "View Collection",
    image: "/images/hero-3.jpg",
    link: "/shop",
    position: "HOME_HERO",
    sortOrder: 2,
  },
]

async function main() {
  const existing = await prisma.banner.count({ where: { position: "HOME_HERO" } })

  if (existing > 0) {
    console.log(`Homepage hero banners already exist: ${existing}`)
    return
  }

  await prisma.banner.createMany({ data: homeHeroSlides })
  console.log(`Seeded ${homeHeroSlides.length} homepage hero banners.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
