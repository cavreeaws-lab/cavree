import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { validate, franchiseSchema } from "@/lib/validators"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    await requireAuth(["SUPER_ADMIN"])
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { owner: { name: { contains: search, mode: "insensitive" } } },
      ]
    }
    if (status === "active") where.isActive = true
    if (status === "inactive") where.isActive = false

    const [franchises, total] = await Promise.all([
      prisma.franchise.findMany({
        where,
        include: { owner: { select: { name: true, email: true } }, _count: { select: { products: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.franchise.count({ where }),
    ])
    return NextResponse.json({ franchises, total, page, limit })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth(["SUPER_ADMIN"])
    const body = await request.json()
    const validation = validate(franchiseSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const { name, ownerId, slug, description, city, state, phone, email, address, isActive, commission } = validation.data
    const franchise = await prisma.franchise.create({
      data: {
        name,
        ownerId,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
        description,
        city,
        state,
        phone,
        email,
        address,
        isActive: isActive ?? true,
        commission: commission ?? 10,
      },
    })
    return NextResponse.json({ franchise }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
