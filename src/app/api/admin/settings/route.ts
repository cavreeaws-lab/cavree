import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, requireAuth, verifyPassword } from "@/lib/auth"
import { validate, settingsUpdateSchema } from "@/lib/validators"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const [franchise, settings] = await Promise.all([
      prisma.franchise.findFirst({ where: { ownerId: session.userId as string } }),
      prisma.setting.findMany({ where: { group: { in: ["ADMIN_PROFILE", "APPEARANCE", "PREFERENCES"] } } }),
    ])
    return NextResponse.json({
      franchise,
      settings: Object.fromEntries(settings.map((setting) => [setting.key, setting.value])),
    })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const body = await request.json()
    const validation = validate(settingsUpdateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const data = validation.data
    if (data.newPassword) {
      const user = await prisma.user.findUnique({ where: { id: session.userId as string } })
      if (!user?.password || !data.currentPassword || !(await verifyPassword(data.currentPassword, user.password))) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
      }
      await prisma.user.update({
        where: { id: session.userId as string },
        data: { password: await hashPassword(data.newPassword) },
      })
    }
    const franchiseFields = {
      name: data.name,
      city: data.city,
      state: data.state,
      address: data.address,
      phone: data.phone,
      email: data.email,
    }
    const franchise = await prisma.franchise.findFirst({ where: { ownerId: session.userId as string } })
    const updated = franchise
      ? await prisma.franchise.update({
          where: { id: franchise.id },
          data: Object.fromEntries(Object.entries(franchiseFields).filter(([, value]) => value !== undefined)),
        })
      : null

    const settingEntries = [
      ["adminId", data.adminId, "ADMIN_PROFILE"],
      ["accentColor", data.accentColor, "APPEARANCE"],
      ["theme", data.theme, "APPEARANCE"],
      ["notifications", data.notifications, "PREFERENCES"],
      ["region", data.region, "PREFERENCES"],
    ] as const
    await Promise.all(settingEntries.filter(([, value]) => value !== undefined).map(([key, value, group]) =>
      prisma.setting.upsert({
        where: { key },
        create: { key, value, group },
        update: { value, group },
      })
    ))

    return NextResponse.json({ franchise: updated })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
