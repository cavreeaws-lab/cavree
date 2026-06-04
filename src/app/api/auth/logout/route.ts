import { NextResponse } from "next/server"
import { deleteSession, requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ message: "No active session" }, { status: 200 })
  }
  await deleteSession()
  return NextResponse.json({ message: "Logged out successfully" })
}
