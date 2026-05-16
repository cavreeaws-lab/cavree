"use client"

import { useState } from "react"
import { ChevronDown, Truck, RotateCcw, CreditCard, Package, HelpCircle } from "lucide-react"

const categories = [
  {
    id: "shipping",
    label: "Shipping",
    icon: Truck,
    questions: [
      {
        q: "How long does shipping take?",
        a: "Standard shipping takes 3-5 business days within India. Express shipping (1-2 business days) is available for select cities at checkout. Orders are processed within 24 hours on business days.",
      },
      {
        q: "Do you offer free shipping?",
        a: "Yes! We offer free standard shipping on all orders above ₹5,000. Orders below this amount are charged a flat shipping fee of ₹99.",
      },
      {
        q: "Do you ship internationally?",
        a: "Currently, we only ship within India. We plan to expand internationally soon. Stay tuned for updates!",
      },
    ],
  },
  {
    id: "returns",
    label: "Returns & Exchanges",
    icon: RotateCcw,
    questions: [
      {
        q: "What is your return policy?",
        a: "We accept returns within 7 days of delivery for unused items with original tags and packaging intact. Sale items and innerwear are non-returnable for hygiene reasons.",
      },
      {
        q: "How do I initiate a return?",
        a: "Go to My Orders, select the order, and click 'Return Item'. Follow the instructions to schedule a pickup. Refunds are processed within 5-7 business days after the item is received.",
      },
      {
        q: "Can I exchange a product for a different size?",
        a: "Yes, size exchanges are available within 7 days. The desired size must be in stock. You can initiate an exchange from the My Orders section.",
      },
    ],
  },
  {
    id: "payment",
    label: "Payment",
    icon: CreditCard,
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept UPI, credit/debit cards (Visa, Mastercard, RuPay), net banking, wallets (Paytm, PhonePe), and Cash on Delivery (COD) for orders above ₹500.",
      },
      {
        q: "Is my payment information secure?",
        a: "Absolutely. All payments are processed through Razorpay with industry-standard SSL encryption. We do not store your card details on our servers.",
      },
      {
        q: "Can I pay in installments?",
        a: "Yes, select products are eligible for No-Cost EMI through select credit cards. EMI options are shown at checkout if available.",
      },
    ],
  },
  {
    id: "orders",
    label: "Orders",
    icon: Package,
    questions: [
      {
        q: "How can I track my order?",
        a: "You can track your order using the Track Order page or through My Orders in your account. You will also receive tracking updates via email and SMS.",
      },
      {
        q: "Can I cancel or modify my order?",
        a: "Orders can be cancelled before they are shipped. Once shipped, cancellation is not possible. For modifications, please contact support immediately.",
      },
      {
        q: "What if I receive a damaged or wrong item?",
        a: "We apologize for the inconvenience. Please contact our support team within 48 hours with photos. We will arrange a free replacement or refund at no extra cost.",
      },
    ],
  },
  {
    id: "general",
    label: "General",
    icon: HelpCircle,
    questions: [
      {
        q: "How do I find my correct size?",
        a: "Please refer to our Size Guide for detailed measurements. If you are between sizes, we recommend sizing up for a comfortable fit.",
      },
      {
        q: "Do you offer gift wrapping?",
        a: "Yes, premium gift wrapping is available at checkout for ₹49. You can also include a personalized message with your gift.",
      },
      {
        q: "How do I contact customer support?",
        a: "You can reach us via email at support@cavree.com or call our helpline at +91 1800-123-4567 (Mon-Sat, 10AM - 7PM IST).",
      },
    ],
  },
]

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("shipping")
  const [openQuestion, setOpenQuestion] = useState<string | null>(null)

  const currentCategory = categories.find((c) => c.id === activeCategory)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="font-playfair text-4xl md:text-5xl font-bold">Frequently Asked Questions</h1>
        <p className="mt-4 text-cavree-muted font-poppins max-w-2xl mx-auto">
          Find answers to common questions about shopping, shipping, returns, and more.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id)
              setOpenQuestion(null)
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium font-poppins transition-colors ${
              activeCategory === cat.id
                ? "bg-cavree-primary text-white"
                : "bg-cavree-light text-cavree-muted hover:text-cavree-foreground"
            }`}
          >
            <cat.icon size={16} />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {currentCategory?.questions.map((item, idx) => {
          const key = `${currentCategory.id}-${idx}`
          const isOpen = openQuestion === key
          return (
            <div key={key} className="border border-cavree-border rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenQuestion(isOpen ? null : key)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-montserrat font-medium text-sm pr-4">{item.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-cavree-muted flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-sm text-cavree-muted font-poppins leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-12 text-center p-8 bg-cavree-light rounded-lg">
        <h3 className="font-montserrat font-semibold mb-2">Still have questions?</h3>
        <p className="text-sm text-cavree-muted font-poppins mb-4">
          Our support team is happy to help you with anything else.
        </p>
        <a
          href="mailto:support@cavree.com"
          className="inline-flex items-center gap-2 bg-cavree-primary hover:bg-cavree-primary-light text-white px-6 py-2.5 rounded-md font-medium text-sm transition-colors"
        >
          Contact Support
        </a>
      </div>
    </div>
  )
}
