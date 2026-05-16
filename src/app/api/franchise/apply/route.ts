import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { validate, franchiseApplicationSchema } from "@/lib/validators"
import { rateLimit } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(request, 5, 60 * 1000)
    if (!limit.success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
    }
    const body = await request.json()
    const validation = validate(franchiseApplicationSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const { name, email, phone, city, investment, space } = validation.data

    const application = await prisma.franchiseApplication.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        phone,
        city,
        investment,
        space,
      },
    })

    // Notify admin via email
    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: "New Franchise Application",
        html: `
          <h2>New Franchise Application</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
          <p><strong>City:</strong> ${escapeHtml(city)}</p>
          <p><strong>Investment:</strong> ${escapeHtml(investment)}</p>
          <p><strong>Space:</strong> ${escapeHtml(space)}</p>
        `,
      })
    }

    return NextResponse.json(
      { application, message: "Application submitted successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Franchise application error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
