import Image from "next/image"
import { Award, Users, Globe, Heart } from "lucide-react"

const values = [
  { icon: Award, title: "Quality First", description: "We curate only the finest luxury fashion from top designers and brands." },
  { icon: Users, title: "Community Driven", description: "Our franchise network empowers local entrepreneurs across India." },
  { icon: Globe, title: "Pan-India Reach", description: "Serving customers from Kashmir to Kanyakumari with premium fashion." },
  { icon: Heart, title: "Customer Love", description: "Your satisfaction is our priority. 24/7 support and easy returns." },
]

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="font-playfair text-4xl md:text-5xl font-bold">About Cavree</h1>
        <p className="mt-4 text-lg text-cavree-muted max-w-2xl mx-auto font-poppins">
          Redefining luxury fashion in India through a connected network of premium franchises
        </p>
      </div>

      {/* Story */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-cavree-light">
          <Image
            src="/images/about-story.jpg"
            alt="Cavree Story"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="font-playfair text-3xl font-bold mb-4">Our Story</h2>
          <div className="space-y-4 text-cavree-muted font-poppins leading-relaxed">
            <p>
              Founded in 2020, Cavree emerged from a simple vision: to make luxury fashion accessible across India
              while empowering local entrepreneurs through our franchise model.
            </p>
            <p>
              What started as a single boutique in Mumbai has grown into a thriving marketplace connecting
              over 50 franchises with thousands of discerning customers nationwide.
            </p>
            <p>
              We believe that fashion is not just about clothing — it&apos;s about confidence, expression, and the
              joy of discovering something truly special.
            </p>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="mb-20">
        <h2 className="font-playfair text-3xl font-bold text-center mb-12">Our Values</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value) => (
            <div key={value.title} className="text-center p-6 border border-cavree-border rounded-lg">
              <div className="w-12 h-12 rounded-full bg-cavree-primary/10 flex items-center justify-center mx-auto mb-4">
                <value.icon size={24} className="text-cavree-primary" />
              </div>
              <h3 className="font-montserrat font-semibold mb-2">{value.title}</h3>
              <p className="text-sm text-cavree-muted font-poppins">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-cavree-primary rounded-lg p-8 md:p-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          <div>
            <p className="font-montserrat text-3xl md:text-4xl font-bold">50+</p>
            <p className="mt-1 text-white/80 font-poppins text-sm">Franchises</p>
          </div>
          <div>
            <p className="font-montserrat text-3xl md:text-4xl font-bold">10K+</p>
            <p className="mt-1 text-white/80 font-poppins text-sm">Products</p>
          </div>
          <div>
            <p className="font-montserrat text-3xl md:text-4xl font-bold">1M+</p>
            <p className="mt-1 text-white/80 font-poppins text-sm">Happy Customers</p>
          </div>
          <div>
            <p className="font-montserrat text-3xl md:text-4xl font-bold">28</p>
            <p className="mt-1 text-white/80 font-poppins text-sm">States Served</p>
          </div>
        </div>
      </div>
    </div>
  )
}
