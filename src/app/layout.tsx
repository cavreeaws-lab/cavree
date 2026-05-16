import type { Metadata } from "next"
import "@/styles/globals.css"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { MobileNav } from "@/components/layout/MobileNav"
import { Toaster } from "react-hot-toast"

export const metadata: Metadata = {
  title: "Cavree - Luxury Fashion",
  description: "Discover luxury fashion at Cavree. Premium clothing, accessories, and more.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      </head>
      <body className="min-h-screen bg-white pb-16 md:pb-0">
        <Header />
        <main>{children}</main>
        <Footer />
        <MobileNav />
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
