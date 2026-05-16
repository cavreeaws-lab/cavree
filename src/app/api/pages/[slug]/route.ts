import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  try {
    const page = await prisma.page.findUnique({ where: { slug: params.slug, isActive: true } })
    if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 })
    return NextResponse.json({ page })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
