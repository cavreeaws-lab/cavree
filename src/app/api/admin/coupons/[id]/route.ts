import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { validate } from "@/lib/validators"
import { z } from "zod"

export const dynamic = "force-dynamic"

const couponUpdateSchema = z.object({
  code: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(["PERCENTAGE", "FLAT"]).optional(),
  value: z.number().positive().optional(),
  minOrder: z.number().optional(),
  maxDiscount: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional(),
})

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const body = await request.json()
    const validation = validate(couponUpdateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const data = validation.data
    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    })
    return NextResponse.json({ coupon })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    await prisma.coupon.delete({ where: { id: params.id } })
    return NextResponse.json({ message: "Coupon deleted" })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
