import { Metadata } from "next"

export function buildMetadata(options: {
  title: string
  description?: string
  image?: string
  url?: string
  type?: "website" | "article"
  publishedAt?: string
  modifiedAt?: string
  noIndex?: boolean
}): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cavree.com"
  return {
    title: options.title,
    description: options.description,
    openGraph: {
      title: options.title,
      description: options.description,
      type: options.type || "website",
      url: options.url ? `${baseUrl}${options.url}` : baseUrl,
      images: options.image ? [{ url: options.image }] : undefined,
      ...(options.publishedAt ? { publishedTime: options.publishedAt } : {}),
      ...(options.modifiedAt ? { modifiedTime: options.modifiedAt } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: options.title,
      description: options.description,
      images: options.image ? [options.image] : undefined,
    },
    robots: options.noIndex ? { index: false, follow: false } : undefined,
  }
}

export function productStructuredData(product: {
  name: string
  description?: string
  image?: string
  sku?: string
  brand?: string
  price: number
  currency?: string
  availability?: string
  url?: string
}) {
  return {
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description,
      image: product.image,
      sku: product.sku,
      brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
      offers: {
        "@type": "Offer",
        price: product.price,
        priceCurrency: product.currency || "INR",
        availability: product.availability || "https://schema.org/InStock",
        url: product.url,
      },
    }),
  }
}

export function organizationStructuredData() {
  return {
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Cavree",
      url: process.env.NEXT_PUBLIC_APP_URL || "https://cavree.com",
      logo: `${process.env.NEXT_PUBLIC_APP_URL || "https://cavree.com"}/logo.png`,
      sameAs: [
        "https://instagram.com/cavree",
      ],
    }),
  }
}
