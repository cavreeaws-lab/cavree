"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

export default function TicketDetailPage() {
  const { id } = useParams()
  const [ticket, setTicket] = useState<any>(null)
  const [reply, setReply] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetch(`/api/tickets/${id}`)
      .then((r) => r.json())
      .then((data) => setTicket(data.ticket))
  }, [id])

  async function sendReply(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    await fetch(`/api/tickets/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: reply }),
    })
    setReply("")
    const refreshed = await fetch(`/api/tickets/${id}`).then((r) => r.json())
    setTicket(refreshed.ticket)
    setSending(false)
  }

  if (!ticket) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{ticket.subject}</h1>
      <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
        <span className="bg-gray-100 px-2 py-1 rounded">{ticket.status}</span>
        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
      </div>

      <div className="space-y-4 mb-8">
        {ticket.messages.map((msg: any) => (
          <div
            key={msg.id}
            className={`p-4 rounded-lg ${
              msg.senderType === "CUSTOMER"
                ? "bg-gray-50 ml-auto max-w-[80%]"
                : "bg-blue-50 mr-auto max-w-[80%]"
            }`}
          >
            <p className="text-sm">{msg.message}</p>
            <p className="text-xs text-gray-400 mt-2">
              {msg.senderType === "CUSTOMER" ? "You" : "Support"} ·{" "}
              {new Date(msg.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={sendReply} className="flex gap-2">
        <input
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type your reply..."
          required
          className="flex-1 border rounded-md px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={sending}
          className="bg-black text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  )
}
