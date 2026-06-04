import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { rateLimit } from "@/lib/rate-limit"
import { validate, createOrderSchema } from "@/lib/validators"
import { sendOrderConfirmationEmail } from "@/lib/email"
import { generateOrderNumber } from "@/lib/admin"
import { routeOrderToFranchise } from "@/lib/order-routing"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    const where: any = { userId: session.userId as string }
    if (status) where.status = status

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          items: true,
          payment: true,
          shippingDetail: true,
          franchise: { select: { name: true } },
        },
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({ orders, total, page, limit })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Orders fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  let idempotencyKey: string | undefined
  let userId = ""
  try {
    const limit = rateLimit(request, 10, 60 * 1000)
    if (!limit.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }
    const session = await requireAuth()
    userId = session.userId as string
    const body = await request.json()
    const validation = validate(createOrderSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const { items, addressId, paymentMethod, couponCode, notes } = validation.data
    const bodyFranchiseId = validation.data.franchiseId
    idempotencyKey = validation.data.idempotencyKey

    if (idempotencyKey) {
      const existingOrder = await prisma.order.findFirst({
        where: { userId, idempotencyKey },
        include: {
          items: true,
          payment: true,
          shippingDetail: true,
        },
      })

      if (existingOrder) {
        return NextResponse.json(
          { order: existingOrder, message: "Order already created", idempotent: true },
          { status: 200 }
        )
      }
    }

    // Validate address belongs to user
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    })
    if (!address) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 })
    }

    // Fetch products to validate and compute totals
    const productIds = items.map((i: any) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { franchise: { select: { id: true } }, variants: true },
    })

    const productMap = new Map(products.map((p: any) => [p.id, p]))

    let subtotal = 0
    const orderItemsData: any[] = []

    let firstFranchiseId: string | null = null
    for (const item of items as any[]) {
      const product: any = productMap.get(item.productId)
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 }
        )
      }
      if (firstFranchiseId === null) {
        firstFranchiseId = product.franchiseId
      } else if (product.franchiseId !== firstFranchiseId) {
        return NextResponse.json(
          { error: "All items in an order must be from the same franchise" },
          { status: 400 }
        )
      }

      const variant = item.variantId ? product.variants.find((v: any) => v.id === item.variantId) : null
      if (product.variants.length > 0 && !item.variantId) {
        return NextResponse.json(
          { error: `Please select a size for ${product.name}` },
          { status: 400 }
        )
      }
      if (item.variantId && !variant) {
        return NextResponse.json(
          { error: `Invalid variant for ${product.name}` },
          { status: 400 }
        )
      }
      const availableQuantity = variant ? variant.quantity : product.quantity
      if (availableQuantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Available: ${availableQuantity}` },
          { status: 400 }
        )
      }

      const price = variant?.price ?? product.price
      const total = price * item.quantity
      subtotal += total

      orderItemsData.push({
        name: product.name,
        sku: product.sku,
        price,
        quantity: item.quantity,
        total,
        size: variant?.size || null,
        color: variant?.color || null,
        productId: product.id,
        variantId: item.variantId || null,
      })
    }

    let franchiseId: string
    let autoAccepted = false
    let routingReason: string

    if (bodyFranchiseId) {
      // Customer shopped from a specific franchise store — route to that franchise
      const franchise = await prisma.franchise.findUnique({
        where: { id: bodyFranchiseId, isActive: true, isApproved: true },
      })
      if (!franchise) {
        return NextResponse.json({ error: "Selected franchise is not available" }, { status: 400 })
      }
      franchiseId = franchise.id
      autoAccepted = (franchise as any).autoAcceptOrders
      routingReason = "Customer purchased from franchise store"
    } else {
      // Auto-route order to franchise based on customer location and stock
      const firstItem = items[0]
      const firstProduct: any = productMap.get(firstItem.productId)
      const firstVariant = firstItem.variantId ? firstProduct.variants.find((v: any) => v.id === firstItem.variantId) : null
      const routed = await routeOrderToFranchise(
        firstItem.productId,
        firstItem.variantId || null,
        firstItem.quantity,
        address.city || "",
        address.pincode || undefined
      )
      franchiseId = routed.franchiseId
      autoAccepted = routed.autoAccepted
      routingReason = routed.reason
    }

    const shipping = 0
    let discount = 0
    let appliedCoupon = null

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } })
      const now = new Date()
      if (coupon && coupon.isActive && subtotal >= coupon.minOrder) {
        if (coupon.startDate > now) {
          return NextResponse.json({ error: "Coupon is not yet active" }, { status: 400 })
        }
        if (coupon.endDate && coupon.endDate < now) {
          return NextResponse.json({ error: "Coupon has expired" }, { status: 400 })
        }
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
          return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 })
        }
        if (coupon.perCustomerLimit) {
          const usageCount = await prisma.couponUsage.count({
            where: { couponId: coupon.id, userId },
          })
          if (usageCount >= coupon.perCustomerLimit) {
            return NextResponse.json({ error: "Coupon already used for this account" }, { status: 400 })
          }
        }
        if (coupon.type === "PERCENTAGE") {
          discount = Math.min((subtotal * coupon.value) / 100, coupon.maxDiscount || Infinity)
        } else {
          discount = coupon.value
        }
        appliedCoupon = coupon
      }
    }

    const tax = 0
    const total = Math.max(0, subtotal - discount)
    const orderNumber = generateOrderNumber()

    const order = await prisma.$transaction(async (tx: any) => {
      // Decrement stock with guard to prevent negative inventory under concurrency
      for (const item of items as any[]) {
        if (item.variantId) {
          const result = await tx.productVariant.updateMany({
            where: { id: item.variantId, quantity: { gte: item.quantity } },
            data: { quantity: { decrement: item.quantity } },
          })
          if (result.count === 0) {
            throw new Error(`Insufficient stock for variant ${item.variantId}`)
          }
        } else {
          const result = await tx.product.updateMany({
            where: { id: item.productId, quantity: { gte: item.quantity } },
            data: { quantity: { decrement: item.quantity } },
          })
          if (result.count === 0) {
            throw new Error(`Insufficient stock for product ${item.productId}`)
          }
        }
        // Also decrement franchise-level stock
        if (franchiseId) {
          const franchiseStock = await tx.productFranchiseStock.findUnique({
            where: { productId_franchiseId: { productId: item.productId, franchiseId } },
          })
          if (franchiseStock) {
            await tx.productFranchiseStock.update({
              where: { id: franchiseStock.id },
              data: { quantity: { decrement: item.quantity } },
            })
          }
        }
      }

      if (appliedCoupon) {
        await tx.coupon.update({
          where: { id: appliedCoupon.id },
          data: { usageCount: { increment: 1 } },
        })
        await tx.couponUsage.create({
          data: {
            couponId: appliedCoupon.id,
            userId,
            discount,
          },
        })
      }

      const isCod = paymentMethod === "COD"
      const orderStatus = isCod ? (autoAccepted ? "CONFIRMED" : "PENDING") : "PENDING"
      const paymentStatus = isCod ? "COMPLETED" : "PENDING"

      return await tx.order.create({
        data: {
          orderNumber,
          status: orderStatus,
          subtotal,
          discount,
          shipping,
          tax,
          total,
          couponCode: couponCode || null,
          notes: notes || null,
          idempotencyKey: idempotencyKey || null,
          userId,
          addressId,
          franchiseId,
          routedAt: new Date(),
          routingReason,
          items: { create: orderItemsData },
          payment: {
            create: {
              amount: total,
              method: isCod ? "COD" : "RAZORPAY",
              status: paymentStatus,
            },
          },
          shippingDetail: {
            create: {
              status: "PENDING",
            },
          },
        },
        include: {
          items: true,
          payment: true,
          shippingDetail: true,
        },
      })
    })

    // Send confirmation email asynchronously (don't block response)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    })
    if (user?.email) {
      sendOrderConfirmationEmail({
        to: user.email,
        orderNumber: order.orderNumber,
        total: order.total,
      }).catch(console.error)
    }

    return NextResponse.json(
      { order, message: "Order created successfully" },
      { status: 201 }
    )
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error.message?.startsWith("Insufficient stock")) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (error.code === "P2002" && idempotencyKey && userId) {
      const existingOrder = await prisma.order.findFirst({
        where: { userId, idempotencyKey },
        include: {
          items: true,
          payment: true,
          shippingDetail: true,
        },
      })
      if (existingOrder) {
        return NextResponse.json(
          { order: existingOrder, message: "Order already created", idempotent: true },
          { status: 200 }
        )
      }
    }
    console.error("Order creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
