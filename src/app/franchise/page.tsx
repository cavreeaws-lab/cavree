import Link from "next/link"
import { CheckCircle, ArrowRight, Store, TrendingUp, Headphones, Truck, LogIn } from "lucide-react"

const benefits = [
  { icon: Store, title: "Premium Brand", description: "Associate with a trusted luxury fashion brand" },
  { icon: TrendingUp, title: "High Margins", description: "Attractive commission structure on every sale" },
  { icon: Headphones, title: "Full Support", description: "Marketing, training, and operational support" },
  { icon: Truck, title: "Easy Logistics", description: "We handle shipping and delivery for you" },
]

const requirements = [
  "Minimum 500 sq. ft. retail space",
  "Investment capacity of ₹10-15 Lakhs",
  "Passion for fashion and retail",
  "Local market knowledge",
  "Commitment to customer service excellence",
]

export default function FranchisePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-cavree-primary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold">Become a Cavree Franchise</h1>
          <p className="mt-4 text-lg text-white/90 max-w-2xl mx-auto font-poppins">
            Join India&apos;s fastest growing luxury fashion franchise network and build your business with us
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/franchise/apply"
              className="inline-flex items-center gap-2 bg-white text-cavree-primary hover:bg-cavree-light px-8 py-3.5 rounded-md font-medium transition-colors"
            >
              Apply Now <ArrowRight size={18} />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 border border-white text-white hover:bg-white/10 px-8 py-3.5 rounded-md font-medium transition-colors"
            >
              <LogIn size={18} />
              Franchise Login
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl font-bold">Why Partner With Us?</h2>
            <p className="text-cavree-muted mt-2 font-poppins">Benefits of becoming a Cavree franchise</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center p-6 border border-cavree-border rounded-lg">
                <div className="w-12 h-12 rounded-full bg-cavree-primary/10 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon size={24} className="text-cavree-primary" />
                </div>
                <h3 className="font-montserrat font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-cavree-muted font-poppins">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16 bg-cavree-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-playfair text-3xl font-bold mb-6">Franchise Requirements</h2>
              <ul className="space-y-4">
                {requirements.map((req) => (
                  <li key={req} className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-cavree-primary flex-shrink-0 mt-0.5" />
                    <span className="font-poppins text-cavree-foreground">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-cavree-border rounded-lg p-8">
              <h3 className="font-playfair text-xl font-bold mb-4">Apply for Franchise</h3>
              <p className="text-cavree-muted font-poppins text-sm mb-6">
                Fill out the application form and our franchise team will contact you within 48 hours.
              </p>
              <Link
                href="/franchise/apply"
                className="w-full bg-cavree-primary hover:bg-cavree-primary-light text-white py-3 rounded-md font-medium text-center block transition-colors"
              >
                Start Application
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
