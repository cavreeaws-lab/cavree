"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function CustomerTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/tickets")
      .then((r) => r.json())
      .then((data) => {
        setTickets(data.tickets || [])
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        <Link href="/account/tickets/new" className="bg-black text-white px-4 py-2 rounded-md text-sm">
          New Ticket
        </Link>
      </div>
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <Link
            key={ticket.id}
            href={`/account/tickets/${ticket.id}`}
            className="block border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{ticket.subject}</h3>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  ticket.status === "OPEN"
                    ? "bg-red-100 text-red-700"
                    : ticket.status === "RESOLVED"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {ticket.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{ticket.category || "General"}</p>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(ticket.createdAt).toLocaleDateString()}
            </p>
          </Link>
        ))}
        {tickets.length === 0 && (
          <p className="text-gray-500 text-center py-12">No tickets yet.</p>
        )}
      </div>
    </div>
  )
}
