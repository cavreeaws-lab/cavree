import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const { code, total } = body
    if (!code) return NextResponse.json({ error: "Coupon code required" }, { status: 400 })

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })
    if (!coupon) return NextResponse.json({ error: "Invalid coupon" }, { status: 400 })
    if (!coupon.isActive) return NextResponse.json({ error: "Coupon is inactive" }, { status: 400 })
    if (coupon.startDate && new Date(coupon.startDate) > new Date()) return NextResponse.json({ error: "Coupon not started" }, { status: 400 })
    if (coupon.endDate && new Date(coupon.endDate) < new Date()) return NextResponse.json({ error: "Coupon expired" }, { status: 400 })
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 })
    if (coupon.perCustomerLimit) {
      const usageCount = await prisma.couponUsage.count({
        where: { couponId: coupon.id, userId: session.userId as string },
      })
      if (usageCount >= coupon.perCustomerLimit) {
        return NextResponse.json({ error: "Coupon already used for this account" }, { status: 400 })
      }
    }
    if (coupon.minOrder !== null && total < coupon.minOrder) return NextResponse.json({ error: `Minimum order value ${coupon.minOrder}` }, { status: 400 })

    const discount = coupon.type === "PERCENTAGE"
      ? Math.min((total * coupon.value) / 100, coupon.maxDiscount ?? Infinity)
      : Math.min(coupon.value, total)

    return NextResponse.json({ discount: Math.round(discount) })
  } catch (error: any) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
