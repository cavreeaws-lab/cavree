import { RotateCcw, Clock, Package, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

const eligibleItems = [
  "Clothing (unworn, with tags attached)",
  "Accessories (unused, in original packaging)",
  "Footwear (unworn, in original box)",
  "Home decor (unused, in original condition)",
]

const nonEligibleItems = [
  "Innerwear and swimwear (for hygiene reasons)",
  "Sale items marked as final sale",
  "Items damaged by customer misuse",
  "Gift cards and promotional vouchers",
]

const timeline = [
  {
    icon: Package,
    title: "Initiate Return",
    desc: "Request a return within 7 days of delivery through My Orders.",
  },
  {
    icon: Clock,
    title: "Pickup Scheduled",
    desc: "Our courier partner will pick up the item within 2-3 business days.",
  },
  {
    icon: CheckCircle,
    title: "Quality Check",
    desc: "Items are inspected for condition and compliance with return policy.",
  },
  {
    icon: RotateCcw,
    title: "Refund / Exchange",
    desc: "Refund processed within 5-7 business days or exchange shipped.",
  },
]

export default function ReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="font-playfair text-4xl md:text-5xl font-bold">Return & Refund Policy</h1>
        <p className="mt-4 text-cavree-muted font-poppins max-w-2xl mx-auto">
          Hassle-free returns within 7 days. We want you to love every purchase.
        </p>
      </div>

      {/* Timeline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {timeline.map((step) => (
          <div key={step.title} className="text-center p-5 border border-cavree-border rounded-lg">
            <div className="w-12 h-12 rounded-full bg-cavree-primary/10 flex items-center justify-center mx-auto mb-4">
              <step.icon size={24} className="text-cavree-primary" />
            </div>
            <h3 className="font-montserrat font-semibold text-sm mb-1">{step.title}</h3>
            <p className="text-xs text-cavree-muted font-poppins leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Eligible */}
        <div className="border border-cavree-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-5">
            <CheckCircle size={22} className="text-green-600" />
            <h2 className="font-montserrat font-semibold text-lg">Eligible for Return</h2>
          </div>
          <ul className="space-y-3">
            {eligibleItems.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-cavree-muted font-poppins">
                <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Non-Eligible */}
        <div className="border border-cavree-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-5">
            <XCircle size={22} className="text-red-500" />
            <h2 className="font-montserrat font-semibold text-lg">Not Eligible for Return</h2>
          </div>
          <ul className="space-y-3">
            {nonEligibleItems.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-cavree-muted font-poppins">
                <XCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Refund Methods */}
      <div className="border border-cavree-border rounded-lg p-6 md:p-8 mb-8">
        <h2 className="font-montserrat font-semibold text-lg mb-6">Refund Methods</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-montserrat font-medium text-sm mb-2">Original Payment</h3>
            <p className="text-sm text-cavree-muted font-poppins leading-relaxed">
              Refunds are credited to the original payment method (UPI, card, net banking) within 5-7 business days.
            </p>
          </div>
          <div>
            <h3 className="font-montserrat font-medium text-sm mb-2">Store Credit</h3>
            <p className="text-sm text-cavree-muted font-poppins leading-relaxed">
              Opt for instant store credit and receive the full amount in your Cavree wallet to use on future purchases.
            </p>
          </div>
          <div>
            <h3 className="font-montserrat font-medium text-sm mb-2">Bank Transfer</h3>
            <p className="text-sm text-cavree-muted font-poppins leading-relaxed">
              For COD orders, refunds are processed via bank transfer. Please share your bank details during the return request.
            </p>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="flex items-start gap-3 p-5 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertTriangle size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-montserrat font-semibold text-sm mb-1 text-amber-800">Important</h3>
          <p className="text-sm text-amber-700 font-poppins leading-relaxed">
            Items must be in original condition with all tags and packaging intact. We reserve the right to reject returns
            that do not meet these criteria. For defective or wrong items, we offer free reverse pickup and a full refund.
          </p>
        </div>
      </div>
    </div>
  )
}
