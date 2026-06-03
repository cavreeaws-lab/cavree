import { describe, it, expect } from "vitest"
import { validate, loginSchema, registerSchema, productSchema, fileUploadSchema, bulkOrderStatusSchema, createOrderSchema } from "@/lib/validators"

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const result = validate(loginSchema, { email: "test@example.com", password: "Password123" })
    expect(result.success).toBe(true)
  })

  it("rejects invalid email", () => {
    const result = validate(loginSchema, { email: "not-an-email", password: "Password123" })
    expect(result.success).toBe(false)
  })

  it("rejects short password", () => {
    const result = validate(loginSchema, { email: "test@example.com", password: "123" })
    expect(result.success).toBe(false)
  })

  it("rejects password under 8 characters", () => {
    const result = validate(loginSchema, { email: "test@example.com", password: "short1" })
    expect(result.success).toBe(false)
  })
})

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const result = validate(registerSchema, {
      email: "new@example.com",
      password: "Password123",
      name: "New User",
    })
    expect(result.success).toBe(true)
  })

  it("rejects missing name", () => {
    const result = validate(registerSchema, { email: "test@example.com", password: "Password123" })
    expect(result.success).toBe(false)
  })

  it("rejects weak passwords with the customer-facing policy", () => {
    expect(validate(registerSchema, { email: "test@example.com", password: "short1", name: "Test" }).success).toBe(false)
    expect(validate(registerSchema, { email: "test@example.com", password: "lowercase1", name: "Test" }).success).toBe(false)
    expect(validate(registerSchema, { email: "test@example.com", password: "UPPERCASE1", name: "Test" }).success).toBe(false)
    expect(validate(registerSchema, { email: "test@example.com", password: "NoNumber", name: "Test" }).success).toBe(false)
  })
})

describe("productSchema", () => {
  it("accepts valid product data", () => {
    const result = validate(productSchema, {
      name: "Test Product",
      price: 999,
      sku: "TEST-001",
      categoryId: "cat123",
      brand: "Cavree",
      lowStockThreshold: 3,
      variants: [{ size: "M", color: "Black", sku: "TEST-001-M", quantity: 5 }],
    })
    expect(result.success).toBe(true)
  })

  it("rejects negative price", () => {
    const result = validate(productSchema, {
      name: "Test",
      price: -10,
      sku: "TEST-001",
      categoryId: "cat123",
    })
    expect(result.success).toBe(false)
  })
})

describe("createOrderSchema", () => {
  it("accepts an idempotency key for checkout retries", () => {
    const result = validate(createOrderSchema, {
      items: [{ productId: "prod1", quantity: 1, variantId: "var1" }],
      addressId: "addr1",
      paymentMethod: "RAZORPAY",
      idempotencyKey: "checkout-retry-key-123",
    })

    expect(result.success).toBe(true)
  })
})

describe("fileUploadSchema", () => {
  it("requires an allowed size payload", () => {
    const result = validate(fileUploadSchema, {
      filename: "dress.jpg",
      contentType: "image/jpeg",
      size: 1024,
    })
    expect(result.success).toBe(true)
  })

  it("rejects oversized upload requests", () => {
    const result = validate(fileUploadSchema, {
      filename: "dress.mp4",
      contentType: "video/mp4",
      size: 101 * 1024 * 1024,
    })
    expect(result.success).toBe(false)
  })
})

describe("bulkOrderStatusSchema", () => {
  it("accepts bulk status updates", () => {
    const result = validate(bulkOrderStatusSchema, {
      orderIds: ["ord1", "ord2"],
      status: "PROCESSING",
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty bulk status selections", () => {
    const result = validate(bulkOrderStatusSchema, {
      orderIds: [],
      status: "PROCESSING",
    })
    expect(result.success).toBe(false)
  })
})
