"use client"

import { useEffect, useState } from "react"

export default function SuperAdminReturnsPage() {
  const [returns, setReturns] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [decision, setDecision] = useState("")
  const [note, setNote] = useState("")
  const [status, setStatus] = useState("APPROVED")

  useEffect(() => {
    fetch("/api/super-admin/returns")
      .then((r) => r.json())
      .then((data) => setReturns(data.returns || []))
  }, [])

  async function submitArbitration() {
    if (!selected) return
    await fetch(`/api/super-admin/returns/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, arbitrationDecision: decision, arbitrationNote: note }),
    })
    const refreshed = await fetch("/api/super-admin/returns").then((r) => r.json())
    setReturns(refreshed.returns || [])
    setSelected(null)
    setDecision("")
    setNote("")
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Return Arbitration</h1>
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-4 py-2">Order</th>
            <th className="text-left px-4 py-2">Reason</th>
            <th className="text-left px-4 py-2">Status</th>
            <th className="text-left px-4 py-2">Arbitrated</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {returns.map((ret) => (
            <tr key={ret.id} className="border-t">
              <td className="px-4 py-2">{ret.order?.orderNumber}</td>
              <td className="px-4 py-2">{ret.reason}</td>
              <td className="px-4 py-2">
                <span className={`text-xs px-2 py-1 rounded-full ${ret.status === "PENDING" ? "bg-yellow-100 text-yellow-700" : ret.status === "APPROVED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {ret.status}
                </span>
              </td>
              <td className="px-4 py-2">{ret.arbitratedAt ? "Yes" : "No"}</td>
              <td className="px-4 py-2">
                {ret.status === "PENDING" && (
                  <button onClick={() => setSelected(ret)} className="text-sm underline">Arbitrate</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">Arbitrate Return</h2>
            <p className="text-sm text-gray-600 mb-4">Order: {selected.order?.orderNumber}</p>
            <p className="text-sm text-gray-600 mb-4">Reason: {selected.reason}</p>
            <div className="space-y-3 mb-4">
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm">
                <option value="APPROVED">Approve Return</option>
                <option value="REJECTED">Reject Return</option>
                <option value="PARTIAL_REFUND">Partial Refund</option>
              </select>
              <input value={decision} onChange={(e) => setDecision(e.target.value)} placeholder="Decision summary" className="w-full border rounded-md px-3 py-2 text-sm" />
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notes" rows={3} className="w-full border rounded-md px-3 py-2 text-sm" />
            </div>
            <div className="flex gap-3">
              <button onClick={submitArbitration} className="bg-black text-white px-4 py-2 rounded-md text-sm">Submit</button>
              <button onClick={() => setSelected(null)} className="border px-4 py-2 rounded-md text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
