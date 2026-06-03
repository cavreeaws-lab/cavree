import { beforeEach, describe, expect, it, vi } from "vitest"

const findUnique = vi.fn()
const create = vi.fn()
const hashPassword = vi.fn(async () => "hashed-password")

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique,
      create,
    },
  },
}))

vi.mock("@/lib/auth", () => ({
  hashPassword,
}))

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: () => ({ success: true }),
}))

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    findUnique.mockReset()
    create.mockReset()
    hashPassword.mockClear()
  })

  it("rejects invalid password data", async () => {
    const { POST } = await import("@/app/api/auth/register/route")
    const response = await POST(new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email: "new@example.com", password: "weak", name: "New User" }),
    }) as any)

    expect(response.status).toBe(400)
    expect(create).not.toHaveBeenCalled()
  })

  it("rejects duplicate email", async () => {
    findUnique.mockResolvedValue({ id: "existing" })
    const { POST } = await import("@/app/api/auth/register/route")
    const response = await POST(new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email: "used@example.com", password: "Password123", name: "New User" }),
    }) as any)

    expect(response.status).toBe(409)
    expect(create).not.toHaveBeenCalled()
  })

  it("normalizes email and creates a customer account", async () => {
    findUnique.mockResolvedValue(null)
    create.mockResolvedValue({ id: "user-1", email: "new@example.com", name: "New User", role: "CUSTOMER" })
    const { POST } = await import("@/app/api/auth/register/route")
    const response = await POST(new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email: "  NEW@Example.COM  ", password: "Password123", name: "New User", phone: "9999999999" }),
    }) as any)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(findUnique).toHaveBeenCalledWith({ where: { email: "new@example.com" } })
    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        email: "new@example.com",
        role: "CUSTOMER",
      }),
    }))
    expect(data.user.email).toBe("new@example.com")
  })
})
