import { FileText, Shield, Scale, AlertCircle } from "lucide-react"

const sections = [
  {
    icon: FileText,
    title: "Introduction",
    content: [
      "Welcome to Cavree. These Terms & Conditions govern your use of our website, products, and services. By accessing or purchasing from Cavree, you agree to be bound by these terms.",
      "We reserve the right to update these terms at any time. Continued use of our platform constitutes acceptance of the revised terms.",
    ],
  },
  {
    icon: Shield,
    title: "User Accounts",
    content: [
      "You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials.",
      "Cavree reserves the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.",
    ],
  },
  {
    icon: Scale,
    title: "Orders & Payments",
    content: [
      "All orders are subject to availability and confirmation. Prices are listed in INR and may change without notice.",
      "We accept UPI, credit/debit cards, net banking, and COD (Cash on Delivery) for orders above ₹500. Payment must be received before order processing.",
      "In the event of a pricing error, we reserve the right to cancel the order and issue a full refund.",
    ],
  },
  {
    icon: AlertCircle,
    title: "Limitation of Liability",
    content: [
      "Cavree shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services.",
      "Our total liability shall not exceed the amount paid for the specific product or service in question.",
    ],
  },
]

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="font-playfair text-4xl md:text-5xl font-bold">Terms & Conditions</h1>
        <p className="mt-4 text-cavree-muted font-poppins max-w-2xl mx-auto">
          Please read these terms carefully before using our website or services.
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
            <div className="space-y-3 text-cavree-muted font-poppins leading-relaxed">
              {section.content.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-cavree-light rounded-lg">
        <h3 className="font-montserrat font-semibold mb-2">Questions?</h3>
        <p className="text-sm text-cavree-muted font-poppins">
          If you have any questions about these Terms & Conditions, please contact us at{" "}
          <a href="mailto:support@cavree.com" className="text-cavree-primary hover:underline">
            support@cavree.com
          </a>
          .
        </p>
      </div>
    </div>
  )
}
