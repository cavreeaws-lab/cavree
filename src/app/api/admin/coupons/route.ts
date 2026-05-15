import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { validate } from "@/lib/validators"
import { z } from "zod"

const couponSchema = z.object({
  code: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["PERCENTAGE", "FLAT"]),
  value: z.number().positive(),
  minOrder: z.number().optional(),
  maxDiscount: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional(),
})

export async function GET() {
  try {
    await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } })
    return NextResponse.json({ coupons })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const body = await request.json()
    const validation = validate(couponSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const data = validation.data
    const coupon = await prisma.coupon.create({
      data: {
        code: data.code,
        description: data.description,
        type: data.type,
        value: data.value,
        minOrder: data.minOrder,
        maxDiscount: data.maxDiscount,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
        isActive: data.isActive ?? true,
      },
    })
    return NextResponse.json({ coupon }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
