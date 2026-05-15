import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { validate, addressSchema } from "@/lib/validators"

export async function GET() {
  try {
    const session = await requireAuth()
    const addresses = await prisma.address.findMany({
      where: { userId: session.userId as string },
      orderBy: { isDefault: "desc" },
    })
    return NextResponse.json({ addresses })
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
    const validation = validate(addressSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const data = validation.data

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.userId as string },
        data: { isDefault: false },
      })
    }

    const address = await prisma.address.create({
      data: {
        name: data.name,
        phone: data.phone,
        address: data.addressLine1 || data.address!,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: data.country || "India",
        isDefault: data.isDefault ?? false,
        type: data.type || "HOME",
        userId: session.userId as string,
      },
    })

    return NextResponse.json({ address })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
