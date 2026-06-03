import { describe, it, expect } from "vitest"
import { formatPrice, formatDate, generateSlug, getInitials, getProductDiscount } from "@/lib/utils"

describe("formatPrice", () => {
  it("formats INR correctly", () => {
    expect(formatPrice(12500)).toBe("₹12,500")
    expect(formatPrice(0)).toBe("₹0")
    expect(formatPrice(999.99)).toBe("₹999.99")
  })
})

describe("formatDate", () => {
  it("formats date string correctly", () => {
    const date = "2024-01-15T10:30:00Z"
    expect(formatDate(date)).toBe("15 January 2024")
  })
})

describe("generateSlug", () => {
  it("generates URL-friendly slugs", () => {
    expect(generateSlug("Hello World")).toBe("hello-world")
    expect(generateSlug("  Multiple   Spaces  ")).toBe("multiple-spaces")
    expect(generateSlug("Special!@#Chars")).toBe("special-chars")
  })
})

describe("getInitials", () => {
  it("returns initials from name", () => {
    expect(getInitials("John Doe")).toBe("JD")
    expect(getInitials("Alice")).toBe("A")
    expect(getInitials("")).toBe("")
  })
})

describe("getProductDiscount", () => {
  it("calculates discount percentage and amount", () => {
    expect(getProductDiscount(849, 2499)).toEqual({
      amount: 1650,
      percent: 66,
      label: "66% OFF",
    })
  })

  it("returns null without a valid compare price", () => {
    expect(getProductDiscount(1000, null)).toBeNull()
    expect(getProductDiscount(1000, 999)).toBeNull()
    expect(getProductDiscount(1000, 1000)).toBeNull()
  })
})
