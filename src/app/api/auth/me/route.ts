import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validate, profileUpdateSchema } from "@/lib/validators"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId as string },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        phone: true,
      },
    })

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Auth me error:", error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validation = validate(profileUpdateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const { name, phone } = validation.data

    const user = await prisma.user.update({
      where: { id: session.userId as string },
      data: { name, phone },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        phone: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
