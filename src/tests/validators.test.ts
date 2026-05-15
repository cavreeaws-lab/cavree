import { describe, it, expect } from "vitest"
import { validate, loginSchema, registerSchema, productSchema } from "@/lib/validators"

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
})

describe("productSchema", () => {
  it("accepts valid product data", () => {
    const result = validate(productSchema, {
      name: "Test Product",
      price: 999,
      sku: "TEST-001",
      categoryId: "cat123",
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
