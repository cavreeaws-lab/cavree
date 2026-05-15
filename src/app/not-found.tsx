import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h2 className="font-playfair text-5xl font-bold mb-4">404</h2>
      <p className="text-cavree-muted font-poppins mb-6 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/" className="bg-cavree-primary text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-cavree-primary-light transition-colors">
        Go Home
      </Link>
    </div>
  )
}
