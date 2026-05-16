import { Lock, Eye, Database, Cookie } from "lucide-react"

const sections = [
  {
    icon: Lock,
    title: "Information We Collect",
    content: [
      "Personal information such as name, email, phone number, and shipping address provided during registration or checkout.",
      "Payment information is processed securely through our payment partners and is not stored on our servers.",
      "Browsing data including IP address, device type, and pages visited to improve our services.",
    ],
  },
  {
    icon: Eye,
    title: "How We Use Your Information",
    content: [
      "To process and fulfill your orders, including shipping and delivery updates.",
      "To communicate promotional offers, new arrivals, and updates (you may opt out at any time).",
      "To improve our website experience and personalize product recommendations.",
      "To comply with legal obligations and prevent fraudulent transactions.",
    ],
  },
  {
    icon: Database,
    title: "Data Sharing & Security",
    content: [
      "We do not sell or rent your personal information to third parties.",
      "Data may be shared with trusted logistics and payment partners solely for order fulfillment.",
      "We implement industry-standard security measures including encryption and secure servers to protect your data.",
    ],
  },
  {
    icon: Cookie,
    title: "Cookies & Tracking",
    content: [
      "Cavree uses cookies to enhance your browsing experience and remember your preferences.",
      "You can manage cookie preferences through your browser settings. Disabling cookies may affect site functionality.",
      "We use analytics tools to understand user behavior and improve our platform.",
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="font-playfair text-4xl md:text-5xl font-bold">Privacy Policy</h1>
        <p className="mt-4 text-cavree-muted font-poppins max-w-2xl mx-auto">
          Your privacy is important to us. This policy explains how we collect, use, and protect your information.
        </p>
      </div>

      <div className="text-sm text-cavree-muted font-poppins mb-8">
        Last updated: December 2024
      </div>

      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.title} className="border border-cavree-border rounded-lg p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-cavree-primary/10 flex items-center justify-center flex-shrink-0">
                <section.icon size={20} className="text-cavree-primary" />
              </div>
              <h2 className="font-montserrat font-semibold text-lg">{section.title}</h2>
            </div>
            <ul className="space-y-2 text-cavree-muted font-poppins leading-relaxed list-disc list-inside">
              {section.content.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-cavree-light rounded-lg">
        <h3 className="font-montserrat font-semibold mb-2">Your Rights</h3>
        <p className="text-sm text-cavree-muted font-poppins">
          You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at{" "}
          <a href="mailto:support@cavree.com" className="text-cavree-primary hover:underline">
            support@cavree.com
          </a>
          .
        </p>
      </div>
    </div>
  )
}
