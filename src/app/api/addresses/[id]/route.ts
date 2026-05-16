import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { validate, addressSchema } from "@/lib/validators"

export const dynamic = "force-dynamic"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const validation = validate(addressSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const data = validation.data

    const existing = await prisma.address.findFirst({
      where: { id: params.id, userId: session.userId as string },
    })
    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.userId as string },
        data: { isDefault: false },
      })
    }

    const address = await prisma.address.update({
      where: { id: params.id },
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()

    const existing = await prisma.address.findFirst({
      where: { id: params.id, userId: session.userId as string },
    })
    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    await prisma.address.delete({ where: { id: params.id } })
    return NextResponse.json({ message: "Address deleted" })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
