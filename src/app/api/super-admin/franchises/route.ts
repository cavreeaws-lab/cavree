import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { validate, franchiseSchema } from "@/lib/validators"

export async function GET() {
  try {
    await requireAuth(["SUPER_ADMIN"])
    const franchises = await prisma.franchise.findMany({
      include: { owner: { select: { name: true, email: true } }, _count: { select: { products: true } } },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ franchises })
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
