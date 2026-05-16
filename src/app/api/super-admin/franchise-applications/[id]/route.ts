import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { validate, franchiseApplicationUpdateSchema } from "@/lib/validators"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"

export const dynamic = "force-dynamic"

function generateTempPassword(): string {
  return randomBytes(6).toString("hex").toUpperCase()
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth(["SUPER_ADMIN"])

    const body = await request.json()
    const validation = validate(franchiseApplicationUpdateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }

    const { action, notes } = validation.data

    const application = await prisma.franchiseApplication.findUnique({
      where: { id: params.id },
    })

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    if (application.status !== "PENDING") {
      return NextResponse.json({ error: "Application already processed" }, { status: 400 })
    }

    if (action === "REJECT") {
      const updated = await prisma.franchiseApplication.update({
        where: { id: params.id },
        data: { status: "REJECTED", notes: notes || null },
      })
      return NextResponse.json({ application: updated, message: "Application rejected" })
    }

    // APPROVE flow
    const existingUser = await prisma.user.findUnique({
      where: { email: application.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      )
    }

    const tempPassword = generateTempPassword()
    const hashedPassword = await bcrypt.hash(tempPassword, 12)

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: application.email,
          password: hashedPassword,
          name: application.name,
          phone: application.phone,
          role: "FRANCHISEE",
        },
      })

      const franchise = await tx.franchise.create({
        data: {
          name: `${application.name} - ${application.city}`,
          slug: `${application.city.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
          description: `Franchise application approved. Investment: ${application.investment}, Space: ${application.space}`,
          city: application.city,
          state: "",
          phone: application.phone,
          email: application.email,
          address: "",
          isActive: true,
          isApproved: true,
          ownerId: user.id,
          commission: 10,
        },
      })

      const updatedApp = await tx.franchiseApplication.update({
        where: { id: params.id },
        data: { status: "APPROVED", notes: notes || null },
      })

      return { user, franchise, updatedApp }
    })

    return NextResponse.json({
      application: result.updatedApp,
      franchise: result.franchise,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
      tempPassword,
      message: "Application approved. Franchise and user account created.",
    })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Franchise application update error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
