import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { csvResponse, toCsv } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    await requireAuth(["SUPER_ADMIN"])
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const franchiseId = searchParams.get("franchiseId")
    const status = searchParams.get("status")
    const exportFormat = searchParams.get("export")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)

    const where: any = {}
    if (franchiseId) where.franchiseId = franchiseId
    if (status === "active") where.isActive = true
    if (status === "inactive") where.isActive = false
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { modelNumber: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { franchise: { name: { contains: search, mode: "insensitive" } } },
      ]
    }

    const include = {
      images: true,
      media: { orderBy: { sortOrder: "asc" } },
      category: { select: { name: true } },
      franchise: { select: { name: true } },
      _count: { select: { orderItems: true } },
    } satisfies Prisma.ProductInclude

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include,
      skip: exportFormat === "csv" ? undefined : (page - 1) * limit,
      take: exportFormat === "csv" ? undefined : limit,
    })
    const total = await prisma.product.count({ where })

    if (exportFormat === "csv") {
      return csvResponse(
        "super-admin-products.csv",
        toCsv(
          products.map((product) => ({
            sku: product.sku,
            modelNumber: product.modelNumber || "",
            name: product.name,
            franchise: product.franchise?.name || "",
            category: product.category?.name || "",
            brand: product.brand || "",
            price: product.price,
            stock: product.quantity,
            status: product.isActive ? "Active" : "Inactive",
            orderItems: product._count.orderItems,
          })),
          [
            { key: "sku", label: "SKU" },
            { key: "modelNumber", label: "Model Number" },
            { key: "name", label: "Name" },
            { key: "franchise", label: "Franchise" },
            { key: "category", label: "Category" },
            { key: "brand", label: "Brand" },
            { key: "price", label: "Price" },
            { key: "stock", label: "Stock" },
            { key: "status", label: "Status" },
            { key: "orderItems", label: "Order Items" },
          ]
        )
      )
    }

    return NextResponse.json({ products, total, page, limit })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
