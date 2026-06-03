"use client"

import { useEffect, useState } from "react"

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [reply, setReply] = useState("")
  const [status, setStatus] = useState("IN_PROGRESS")

  useEffect(() => {
    fetch("/api/admin/tickets")
      .then((r) => r.json())
      .then((data) => setTickets(data.tickets || []))
  }, [])

  async function sendReply() {
    if (!selected || !reply) return
    await fetch("/api/admin/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId: selected.id, message: reply, status }),
    })
    setReply("")
    const refreshed = await fetch("/api/admin/tickets").then((r) => r.json())
    setTickets(refreshed.tickets || [])
    const updated = refreshed.tickets.find((t: any) => t.id === selected.id)
    if (updated) setSelected(updated)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Support Tickets</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-lg overflow-hidden">
          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => setSelected(ticket)}
              className={`w-full text-left px-4 py-3 border-b last:border-0 ${selected?.id === ticket.id ? "bg-gray-50" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate">{ticket.subject}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${ticket.status === "OPEN" ? "bg-red-100 text-red-700" : ticket.status === "RESOLVED" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                  {ticket.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{new Date(ticket.createdAt).toLocaleDateString()}</p>
            </button>
          ))}
        </div>

        <div className="md:col-span-2 border rounded-lg p-4">
          {selected ? (
            <>
              <h2 className="text-lg font-semibold mb-2">{selected.subject}</h2>
              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {selected.messages?.map((msg: any) => (
                  <div key={msg.id} className={`p-3 rounded-lg text-sm ${msg.senderType === "CUSTOMER" ? "bg-gray-50" : "bg-blue-50"}`}>
                    <p>{msg.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{msg.senderType} · {new Date(msg.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded-md px-2 py-2 text-sm">
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type reply..."
                  className="flex-1 border rounded-md px-3 py-2 text-sm"
                />
                <button onClick={sendReply} className="bg-black text-white px-4 py-2 rounded-md text-sm">Reply</button>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center py-12">Select a ticket to view details</p>
          )}
        </div>
      </div>
    </div>
  )
}
