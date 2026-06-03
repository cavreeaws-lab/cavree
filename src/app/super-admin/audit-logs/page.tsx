"use client"

import { useEffect, useState } from "react"

export default function SuperAdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetch(`/api/super-admin/audit-logs?page=${page}`)
      .then((r) => r.json())
      .then((data) => {
        setLogs(data.logs || [])
        setTotal(data.total || 0)
      })
  }, [page])

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-4 py-2">Timestamp</th>
            <th className="text-left px-4 py-2">Action</th>
            <th className="text-left px-4 py-2">Entity</th>
            <th className="text-left px-4 py-2">Entity ID</th>
            <th className="text-left px-4 py-2">User</th>
            <th className="text-left px-4 py-2">Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-t">
              <td className="px-4 py-2 text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
              <td className="px-4 py-2"><span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{log.action}</span></td>
              <td className="px-4 py-2">{log.entity}</td>
              <td className="px-4 py-2 text-xs text-gray-500">{log.entityId}</td>
              <td className="px-4 py-2 text-xs text-gray-500">{log.userId || "System"}</td>
              <td className="px-4 py-2 text-xs text-gray-500">{log.details ? JSON.stringify(log.details).slice(0, 60) : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between mt-4">
        <button disabled={page === 1} onClick={() => setPage(page - 1)} className="text-sm px-3 py-1 border rounded disabled:opacity-50">Previous</button>
        <span className="text-sm text-gray-500">Page {page}</span>
        <button disabled={logs.length < 20} onClick={() => setPage(page + 1)} className="text-sm px-3 py-1 border rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  )
}
