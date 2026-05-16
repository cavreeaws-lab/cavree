"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { CheckCircle, XCircle, MapPin, Phone, Mail, User, Calendar, DollarSign, Ruler } from "lucide-react"

interface FranchiseApplication {
  id: string
  name: string
  email: string
  phone: string
  city: string
  investment: string
  space: string
  status: string
  notes: string | null
  createdAt: string
}

export default function FranchiseApplicationsPage() {
  const [applications, setApplications] = useState<FranchiseApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [filter, setFilter] = useState("ALL")
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [selectedApp, setSelectedApp] = useState<FranchiseApplication | null>(null)
  const [notes, setNotes] = useState("")
  const [modalAction, setModalAction] = useState<"APPROVE" | "REJECT" | null>(null)

  const fetchApplications = () => {
    fetch("/api/super-admin/franchise-applications")
      .then((res) => res.json())
      .then((data) => { setApplications(data.applications || []); setLoading(false) })
      .catch(() => { toast.error("Failed to load applications"); setLoading(false) })
  }

  useEffect(() => { fetchApplications() }, [])

  const handleAction = async () => {
    if (!selectedApp || !modalAction) return
    setProcessingId(selectedApp.id)
    try {
      const res = await fetch(`/api/super-admin/franchise-applications/${selectedApp.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: modalAction, notes: notes || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed")
      }
      if (modalAction === "APPROVE" && data.tempPassword) {
        setTempPassword(data.tempPassword)
        toast.success("Application approved! Credentials generated.")
      } else {
        toast.success(modalAction === "APPROVE" ? "Application approved" : "Application rejected")
        closeModal()
      }
      fetchApplications()
    } catch (err: any) {
      toast.error(err.message || "Action failed")
    } finally {
      setProcessingId(null)
    }
  }

  const openModal = (app: FranchiseApplication, action: "APPROVE" | "REJECT") => {
    setSelectedApp(app)
    setModalAction(action)
    setNotes("")
    setTempPassword(null)
  }

  const closeModal = () => {
    setSelectedApp(null)
    setModalAction(null)
    setNotes("")
    setTempPassword(null)
  }

  const filtered = filter === "ALL" ? applications : applications.filter((a) => a.status === filter)

  const statusBadge = (status: string) => {
    const classes: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
    }
    return (
      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${classes[status] || "bg-gray-100 text-gray-800"}`}>
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="font-playfair text-xl font-bold">Franchise Applications</h2>
        <div className="animate-pulse bg-white border border-cavree-border rounded-lg h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-playfair text-xl font-bold">Franchise Applications</h2>
        <div className="flex items-center gap-2">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === s ? "bg-cavree-primary text-white" : "bg-white border border-cavree-border text-cavree-muted hover:text-cavree-foreground"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-cavree-border rounded-lg overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-cavree-muted font-poppins">No applications found.</div>
        ) : (
          <div className="divide-y divide-cavree-border">
            {filtered.map((app) => (
              <div key={app.id} className="p-6 hover:bg-cavree-light/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-cavree-primary" />
                        <span className="font-medium text-sm">{app.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-cavree-muted">
                        <Mail size={14} />
                        {app.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-cavree-muted">
                        <Phone size={14} />
                        {app.phone}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin size={16} className="text-cavree-primary" />
                        {app.city}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-cavree-muted">
                        <DollarSign size={14} />
                        Investment: {app.investment}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-cavree-muted">
                        <Ruler size={14} />
                        Space: {app.space}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-cavree-muted">
                        <Calendar size={14} />
                        {new Date(app.createdAt).toLocaleDateString("en-IN")}
                      </div>
                      <div>{statusBadge(app.status)}</div>
                      {app.notes && (
                        <p className="text-xs text-cavree-muted italic">Note: {app.notes}</p>
                      )}
                    </div>
                  </div>
                  {app.status === "PENDING" && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openModal(app, "APPROVE")}
                        disabled={processingId === app.id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        <CheckCircle size={14} />
                        Approve
                      </button>
                      <button
                        onClick={() => openModal(app, "REJECT")}
                        disabled={processingId === app.id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedApp && modalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-playfair text-lg font-bold">
              {modalAction === "APPROVE" ? "Approve Application" : "Reject Application"}
            </h3>
            <p className="text-sm text-cavree-muted font-poppins">
              {modalAction === "APPROVE"
                ? `This will create a franchisee user account and a franchise for ${selectedApp.name} in ${selectedApp.city}.`
                : `This will reject the application from ${selectedApp.name}.`}
            </p>

            {!tempPassword && (
              <div>
                <label className="block text-sm font-medium mb-1.5">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-cavree-border rounded-md text-sm outline-none focus:border-cavree-primary resize-none h-20"
                  placeholder="Add any notes..."
                />
              </div>
            )}

            {tempPassword && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 space-y-2">
                <p className="text-sm font-medium text-green-800">Application Approved!</p>
                <p className="text-xs text-green-700">Share these credentials with the franchisee:</p>
                <div className="text-sm font-mono bg-white border border-green-200 rounded px-3 py-2">
                  Email: {selectedApp.email}<br />
                  Password: <span className="font-bold">{tempPassword}</span>
                </div>
                <p className="text-xs text-green-600">They can log in at franchise.cavree.com</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              {!tempPassword ? (
                <>
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 rounded-md text-sm font-medium border border-cavree-border hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAction}
                    disabled={processingId === selectedApp.id}
                    className={`px-4 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50 transition-colors ${modalAction === "APPROVE" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                  >
                    {processingId === selectedApp.id ? "Processing..." : modalAction === "APPROVE" ? "Approve" : "Reject"}
                  </button>
                </>
              ) : (
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-cavree-primary text-white hover:bg-cavree-primary-light transition-colors"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
