import { Truck, Clock, MapPin, PackageCheck, AlertCircle } from "lucide-react"

const zones = [
  {
    zone: "Metro Cities",
    cities: "Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata, Pune",
    standard: "2-3 business days",
    express: "1-2 business days",
    standardFee: "₹99 or Free above ₹5,000",
    expressFee: "₹249",
  },
  {
    zone: "Tier 2 Cities",
    cities: "Ahmedabad, Jaipur, Lucknow, Kochi, Chandigarh, Indore, Nagpur, etc.",
    standard: "3-5 business days",
    express: "2-3 business days",
    standardFee: "₹99 or Free above ₹5,000",
    expressFee: "₹249",
  },
  {
    zone: "Rest of India",
    cities: "All other cities and towns",
    standard: "5-7 business days",
    express: "3-4 business days",
    standardFee: "₹99 or Free above ₹5,000",
    expressFee: "₹249",
  },
]

const steps = [
  {
    icon: PackageCheck,
    title: "Order Placed",
    desc: "We confirm your order and begin processing within 24 hours.",
  },
  {
    icon: Truck,
    title: "Shipped",
    desc: "Your order is packed and handed to our courier partner.",
  },
  {
    icon: MapPin,
    title: "Out for Delivery",
    desc: "The package is with the delivery agent and will reach you today.",
  },
  {
    icon: Clock,
    title: "Delivered",
    desc: "Your order has been delivered. Enjoy your purchase!",
  },
]

export default function ShippingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="font-playfair text-4xl md:text-5xl font-bold">Shipping Policy</h1>
        <p className="mt-4 text-cavree-muted font-poppins max-w-2xl mx-auto">
          Fast and reliable delivery across India. Free shipping available on qualifying orders.
        </p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {steps.map((step) => (
          <div key={step.title} className="text-center p-5 border border-cavree-border rounded-lg">
            <div className="w-12 h-12 rounded-full bg-cavree-primary/10 flex items-center justify-center mx-auto mb-4">
              <step.icon size={24} className="text-cavree-primary" />
            </div>
            <h3 className="font-montserrat font-semibold text-sm mb-1">{step.title}</h3>
            <p className="text-xs text-cavree-muted font-poppins leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Zones Table */}
      <div className="mb-12">
        <h2 className="font-montserrat font-semibold text-lg mb-4">Delivery Zones & Charges</h2>
        <div className="border border-cavree-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cavree-light border-b border-cavree-border">
                  <th className="text-left py-3 px-4 font-montserrat font-semibold text-xs uppercase tracking-wide text-cavree-muted">Zone</th>
                  <th className="text-left py-3 px-4 font-montserrat font-semibold text-xs uppercase tracking-wide text-cavree-muted">Standard</th>
                  <th className="text-left py-3 px-4 font-montserrat font-semibold text-xs uppercase tracking-wide text-cavree-muted">Express</th>
                  <th className="text-left py-3 px-4 font-montserrat font-semibold text-xs uppercase tracking-wide text-cavree-muted">Fee</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((z) => (
                  <tr key={z.zone} className="border-b border-cavree-border last:border-0">
                    <td className="py-4 px-4">
                      <p className="font-montserrat font-medium text-sm">{z.zone}</p>
                      <p className="text-xs text-cavree-muted font-poppins mt-0.5">{z.cities}</p>
                    </td>
                    <td className="py-4 px-4 font-poppins text-sm text-cavree-foreground">{z.standard}</td>
                    <td className="py-4 px-4 font-poppins text-sm text-cavree-foreground">{z.express}</td>
                    <td className="py-4 px-4 font-poppins text-sm text-cavree-foreground">
                      <p>{z.standardFee}</p>
                      <p className="text-xs text-cavree-muted mt-0.5">Express: {z.expressFee}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-4">
        <h2 className="font-montserrat font-semibold text-lg">Important Notes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-5 border border-cavree-border rounded-lg">
            <AlertCircle size={18} className="text-cavree-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-montserrat font-medium text-sm mb-1">Processing Time</h3>
              <p className="text-sm text-cavree-muted font-poppins leading-relaxed">
                Orders are processed within 24 hours on business days. Orders placed on weekends or holidays are processed the next business day.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-5 border border-cavree-border rounded-lg">
            <AlertCircle size={18} className="text-cavree-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-montserrat font-medium text-sm mb-1">Multiple Shipments</h3>
              <p className="text-sm text-cavree-muted font-poppins leading-relaxed">
                If your order contains items from different warehouses, they may arrive in separate packages with separate tracking numbers.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-5 border border-cavree-border rounded-lg">
            <AlertCircle size={18} className="text-cavree-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-montserrat font-medium text-sm mb-1">Failed Delivery</h3>
              <p className="text-sm text-cavree-muted font-poppins leading-relaxed">
                If delivery fails after 3 attempts, the package will be returned to us. A reshipping fee may apply.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-5 border border-cavree-border rounded-lg">
            <AlertCircle size={18} className="text-cavree-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-montserrat font-medium text-sm mb-1">Order Tracking</h3>
              <p className="text-sm text-cavree-muted font-poppins leading-relaxed">
                Tracking details are sent via email and SMS once your order is shipped. You can also track via your account or our Track Order page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
