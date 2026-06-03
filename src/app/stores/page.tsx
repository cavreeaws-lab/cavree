"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Store, MapPin, Phone, Mail, Search, ChevronRight } from "lucide-react"
import toast from "react-hot-toast"

export default function StoresPage() {
  const [franchises, setFranchises] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/franchises")
      .then((res) => res.json())
      .then((data) => {
        setFranchises(data.franchises || [])
        setLoading(false)
      })
      .catch(() => {
        toast.error("Failed to load stores")
        setLoading(false)
      })
  }, [])

  const filtered = franchises.filter((f) => {
    const q = search.toLowerCase()
    return (
      f.name.toLowerCase().includes(q) ||
      (f.city && f.city.toLowerCase().includes(q)) ||
      (f.state && f.state.toLowerCase().includes(q))
    )
  })

  const cities = Array.from(new Set(franchises.map((f) => f.city).filter(Boolean))).sort()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-cavree-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-playfair text-3xl md:text-4xl font-bold">Our Franchise Stores</h1>
          <p className="mt-3 text-white/80 max-w-xl mx-auto font-poppins">
            Shop from our network of premium Cavree franchise stores across India
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="relative max-w-md mb-8">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cavree-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by store name or city..."
            className="w-full rounded-md border border-cavree-border py-2.5 pl-9 pr-3 text-sm outline-none focus:border-cavree-primary"
          />
        </div>

        {/* City chips */}
        {cities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSearch("")}
              className={`rounded-md px-3 py-1.5 text-sm ${!search ? "bg-cavree-primary text-white" : "bg-white border border-cavree-border"}`}
            >
              All Cities
            </button>
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSearch(city)}
                className={`rounded-md px-3 py-1.5 text-sm ${search === city ? "bg-cavree-primary text-white" : "bg-white border border-cavree-border"}`}
              >
                {city}
              </button>
            ))}
          </div>
        )}

        {/* Stores grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-lg border border-cavree-border bg-white" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Store size={48} className="mx-auto text-cavree-muted" />
            <h2 className="mt-4 font-playfair text-xl font-bold">No stores found</h2>
            <p className="mt-2 text-sm text-cavree-muted">Try a different search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((franchise) => (
              <Link
                key={franchise.id}
                href={`/store/${franchise.slug}`}
                className="group rounded-lg border border-cavree-border bg-white overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative h-40 bg-cavree-light">
                  {franchise.banner ? (
                    <Image src={franchise.banner} alt={franchise.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : franchise.logo ? (
                    <Image src={franchise.logo} alt={franchise.name} fill className="object-contain p-6" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Store size={48} className="text-cavree-muted" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-playfair text-lg font-bold group-hover:text-cavree-primary transition-colors">
                    {franchise.name}
                  </h3>
                  <div className="mt-2 space-y-1">
                    {franchise.city && (
                      <p className="text-sm text-cavree-muted flex items-center gap-1">
                        <MapPin size={14} /> {franchise.city}{franchise.state ? `, ${franchise.state}` : ""}
                      </p>
                    )}
                    {franchise.phone && (
                      <p className="text-sm text-cavree-muted flex items-center gap-1">
                        <Phone size={14} /> {franchise.phone}
                      </p>
                    )}
                    {franchise.email && (
                      <p className="text-sm text-cavree-muted flex items-center gap-1">
                        <Mail size={14} /> {franchise.email}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-cavree-muted">
                      {franchise._count?.products || 0} products
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm text-cavree-primary font-medium">
                      Visit Store <ChevronRight size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
