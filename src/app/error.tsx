"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h2 className="font-playfair text-3xl font-bold mb-4">Something went wrong</h2>
      <p className="text-cavree-muted font-poppins mb-6 max-w-md">
        We encountered an unexpected error. Please try again or return to the homepage.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-cavree-primary text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-cavree-primary-light transition-colors"
        >
          Try Again
        </button>
        <Link href="/" className="border border-cavree-border px-5 py-2.5 rounded-md text-sm font-medium hover:bg-cavree-light transition-colors">
          Go Home
        </Link>
      </div>
    </div>
  )
}
