"use client"

import { useState } from "react"
import { Mail, Phone, MapPin, Send } from "lucide-react"
import toast from "react-hot-toast"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Message sent! We will get back to you soon.")
    setFormData({ name: "", email: "", subject: "", message: "" })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="font-playfair text-4xl font-bold">Get in Touch</h1>
        <p className="mt-4 text-cavree-muted font-poppins">We&apos;d love to hear from you</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-6 border border-cavree-border rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-cavree-primary/10 flex items-center justify-center flex-shrink-0">
              <Mail size={20} className="text-cavree-primary" />
            </div>
            <div>
              <h3 className="font-montserrat font-semibold mb-1">Email</h3>
              <p className="text-sm text-cavree-muted font-poppins">support@cavree.com</p>
              <p className="text-sm text-cavree-muted font-poppins">franchise@cavree.com</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 border border-cavree-border rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-cavree-primary/10 flex items-center justify-center flex-shrink-0">
              <Phone size={20} className="text-cavree-primary" />
            </div>
            <div>
              <h3 className="font-montserrat font-semibold mb-1">Phone</h3>
              <p className="text-sm text-cavree-muted font-poppins">+91 1800-123-4567</p>
              <p className="text-sm text-cavree-muted font-poppins">Mon-Sat, 10AM - 7PM IST</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 border border-cavree-border rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-cavree-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin size={20} className="text-cavree-primary" />
            </div>
            <div>
              <h3 className="font-montserrat font-semibold mb-1">Head Office</h3>
              <p className="text-sm text-cavree-muted font-poppins">
                123 Fashion Street, Bandra West<br />
                Mumbai, Maharashtra 400050<br />
                India
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="border border-cavree-border rounded-lg p-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-1.5 font-poppins">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-cavree-border rounded-md text-sm outline-none focus:border-cavree-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 font-poppins">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-cavree-border rounded-md text-sm outline-none focus:border-cavree-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 font-poppins">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-cavree-border rounded-md text-sm outline-none focus:border-cavree-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 font-poppins">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={5}
                className="w-full px-4 py-2.5 border border-cavree-border rounded-md text-sm outline-none focus:border-cavree-primary transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-cavree-primary hover:bg-cavree-primary-light text-white px-6 py-2.5 rounded-md font-medium transition-colors"
            >
              <Send size={16} />
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
