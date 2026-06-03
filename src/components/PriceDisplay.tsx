import { formatPrice, getProductDiscount } from "@/lib/utils"

type PriceDisplayProps = {
  price: number
  comparePrice?: number | null
  size?: "sm" | "md" | "lg"
  align?: "left" | "right"
  showSavedAmount?: boolean
}

export function PriceDisplay({ price, comparePrice, size = "md", align = "left", showSavedAmount = false }: PriceDisplayProps) {
  const discount = getProductDiscount(price, comparePrice)
  const priceClass = size === "lg" ? "text-2xl font-bold" : size === "sm" ? "text-sm font-semibold" : "text-base font-semibold"
  const compareClass = size === "lg" ? "text-lg" : "text-xs"

  return (
    <div className={`flex flex-wrap items-center gap-2 ${align === "right" ? "justify-end" : ""}`}>
      <span className={`font-montserrat ${priceClass}`}>{formatPrice(price)}</span>
      {discount && (
        <>
          <span className={`${compareClass} text-cavree-muted-light line-through`}>{formatPrice(comparePrice!)}</span>
          <span className="rounded bg-cavree-secondary px-2 py-0.5 text-[11px] font-semibold text-white">
            {discount.label}
          </span>
          {showSavedAmount && (
            <span className="text-xs font-medium text-green-700">Save {formatPrice(discount.amount)}</span>
          )}
        </>
      )}
    </div>
  )
}
