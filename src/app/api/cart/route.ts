import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

async function getCartWithStock(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              quantity: true,
              isActive: true,
              images: { take: 1 },
            },
          },
          variant: {
            select: {
              id: true,
              size: true,
              color: true,
              price: true,
              quantity: true,
            },
          },
        },
      },
    },
  })

  const itemsWithStock = (cart?.items || []).map((item) => {
    const availableQty = item.variant?.quantity ?? item.product.quantity
    const isOutOfStock = availableQty < item.quantity
    return {
      ...item,
      availableQty,
      isOutOfStock,
      isLowStock: availableQty > 0 && availableQty <= 5,
    }
  })

  const subtotal = itemsWithStock.reduce((sum, item) => {
    const price = item.variant?.price ?? item.product.price
    return sum + price * item.quantity
  }, 0)

  return {
    cart: cart
      ? {
          ...cart,
          items: itemsWithStock,
        }
      : null,
    summary: {
      itemCount: itemsWithStock.length,
      totalQuantity: itemsWithStock.reduce((s, i) => s + i.quantity, 0),
      subtotal,
      outOfStockItems: itemsWithStock.filter((i) => i.isOutOfStock).length,
    },
  }
}

export async function GET() {
  try {
    const session = await requireAuth()
    return NextResponse.json(await getCartWithStock(session.userId as string))
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const { productId, variantId, quantity = 1 } = body

    if (!productId || quantity < 1) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    })

    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Product not found or inactive" }, { status: 404 })
    }

    const variant = variantId
      ? product.variants.find((v) => v.id === variantId)
      : null
    if (variantId && !variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 })
    }

    const availableQty = variant?.quantity ?? product.quantity
    if (availableQty < quantity) {
      return NextResponse.json(
        { error: `Insufficient stock. Available: ${availableQty}, Requested: ${quantity}` },
        { status: 400 }
      )
    }

    const cart = await prisma.cart.upsert({
      where: { userId: session.userId as string },
      create: { userId: session.userId as string },
      update: {},
    })

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
      },
    })

    const newQty = existingItem ? existingItem.quantity + quantity : quantity
    if (availableQty < newQty) {
      return NextResponse.json(
        { error: `Insufficient stock for total quantity. Available: ${availableQty}, In cart: ${newQty}` },
        { status: 400 }
      )
    }

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      })
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
          quantity,
        },
      })
    }

    return NextResponse.json(await getCartWithStock(session.userId as string))
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const { itemId, quantity } = body

    if (!itemId || quantity < 1) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: itemId, cart: { userId: session.userId as string } },
      include: { product: { select: { quantity: true } }, variant: { select: { quantity: true } } },
    })

    if (!cartItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 })
    }

    const availableQty = cartItem.variant?.quantity ?? cartItem.product.quantity
    if (availableQty < quantity) {
      return NextResponse.json(
        { error: `Insufficient stock. Available: ${availableQty}, Requested: ${quantity}` },
        { status: 400 }
      )
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    })

    return NextResponse.json(await getCartWithStock(session.userId as string))
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("itemId")

    const cart = await prisma.cart.findUnique({ where: { userId: session.userId as string } })
    if (!cart) return NextResponse.json(await getCartWithStock(session.userId as string))

    if (itemId) {
      await prisma.cartItem.deleteMany({
        where: { id: itemId, cartId: cart.id },
      })
    } else {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
    }

    return NextResponse.json(await getCartWithStock(session.userId as string))
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
