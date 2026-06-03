import { prisma } from "@/lib/prisma"

export async function getAdminScope(session: unknown) {
  const payload = session as { userId?: unknown; role?: unknown; email?: unknown }
  const role = String(payload.role || "")
  const userId = String(payload.userId || "")

  if (role === "FRANCHISEE") {
    const franchise = await prisma.franchise.findFirst({
      where: { ownerId: userId },
      select: { id: true },
    })
    return {
      role,
      userId,
      franchiseId: franchise?.id,
      isFranchiseScoped: true,
    }
  }

  return {
    role,
    userId,
    franchiseId: undefined,
    isFranchiseScoped: false,
  }
}

export async function logActivity(input: {
  userId?: string
  action: string
  entity: string
  entityId?: string
  details?: Record<string, unknown>
}) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        details: (input.details || {}) as any,
      },
    })
  } catch (error) {
    console.error("Activity log failed:", error)
  }
}

export function generateOrderNumber() {
  const stamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `ORD-${stamp}-${random}`
}

export function generateInvoiceNumber(orderNumber: string) {
  return `INV-${orderNumber.replace(/^ORD-/, "")}`
}

export function toCsv(rows: Array<Record<string, unknown>>, columns: Array<{ key: string; label: string }>) {
  const escape = (value: unknown) => {
    if (value === null || value === undefined) return ""
    const text = String(value)
    if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`
    return text
  }

  return [
    columns.map((column) => escape(column.label)).join(","),
    ...rows.map((row) => columns.map((column) => escape(row[column.key])).join(",")),
  ].join("\n")
}

export function csvResponse(filename: string, csv: string) {
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
