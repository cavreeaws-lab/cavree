import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { getAdminScope, logActivity } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const scope = await getAdminScope(session)
    const warehouses = await prisma.warehouse.findMany({
      where: scope.franchiseId ? { franchiseId: scope.franchiseId } : {},
      orderBy: { createdAt: "desc" },
      include: {
        franchise: { select: { id: true, name: true } },
        coordinators: true,
        movements: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    })
    return NextResponse.json({ warehouses })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(["ADMIN", "SUPER_ADMIN"])
    const body = await request.json()
    const warehouse = await prisma.warehouse.create({
      data: {
        name: String(body.name || "Warehouse"),
        city: body.city || null,
        state: body.state || null,
        address: body.address || null,
        franchiseId: body.franchiseId || null,
        coordinators: body.coordinatorName
          ? {
              create: {
                name: body.coordinatorName,
                email: body.coordinatorEmail || `${Date.now()}@cavree.local`,
                phone: body.coordinatorPhone || null,
              },
            }
          : undefined,
      },
      include: { coordinators: true },
    })
    await logActivity({
      userId: session.userId as string,
      action: "CREATE",
      entity: "Warehouse",
      entityId: warehouse.id,
      details: { name: warehouse.name },
    })
    return NextResponse.json({ warehouse }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Warehouse create error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth(["ADMIN", "SUPER_ADMIN"])
    const body = await request.json()
    const warehouseId = String(body.warehouseId || "")
    if (!warehouseId) return NextResponse.json({ error: "Warehouse is required" }, { status: 400 })
    const movement = await prisma.stockMovement.create({
      data: {
        warehouseId,
        productCode: body.productCode || null,
        productName: String(body.productName || "Stock adjustment"),
        quantity: Number(body.quantity || 0),
        type: body.type || "ADJUSTMENT",
        reason: body.reason || null,
        createdBy: session.userId as string,
      },
    })
    await logActivity({
      userId: session.userId as string,
      action: "CREATE_STOCK_MOVEMENT",
      entity: "StockMovement",
      entityId: movement.id,
      details: { productName: movement.productName, quantity: movement.quantity, type: movement.type },
    })
    return NextResponse.json({ movement }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Stock movement create error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
