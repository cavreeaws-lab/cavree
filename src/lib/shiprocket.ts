const SHIPROCKET_API_BASE = "https://apiv2.shiprocket.in/v1/external"

function getAuthHeaders() {
  const token = process.env.SHIPROCKET_API_TOKEN
  if (!token) {
    throw new Error("SHIPROCKET_API_TOKEN is not configured")
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }
}

export async function authenticateShiprocket(email: string, password: string) {
  const res = await fetch(`${SHIPROCKET_API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    throw new Error(`Shiprocket auth failed: ${res.status}`)
  }
  return await res.json()
}

export async function createShiprocketOrder(payload: any) {
  const res = await fetch(`${SHIPROCKET_API_BASE}/orders/create/adhoc`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Shiprocket create order failed: ${res.status} - ${err}`)
  }
  return await res.json()
}

export async function generateAWB(shipmentId: string, courierId?: string) {
  const res = await fetch(`${SHIPROCKET_API_BASE}/courier/assign/awb`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ shipment_id: shipmentId, courier_id: courierId }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Shiprocket AWB failed: ${res.status} - ${err}`)
  }
  return await res.json()
}

export async function trackShipment(awbCode: string) {
  const res = await fetch(`${SHIPROCKET_API_BASE}/courier/track/awb/${awbCode}`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    throw new Error(`Shiprocket track failed: ${res.status}`)
  }
  return await res.json()
}

export async function cancelShiprocketOrder(ids: number[]) {
  const res = await fetch(`${SHIPROCKET_API_BASE}/orders/cancel`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ ids }),
  })
  if (!res.ok) {
    throw new Error(`Shiprocket cancel failed: ${res.status}`)
  }
  return await res.json()
}

export async function getCouriers() {
  const res = await fetch(`${SHIPROCKET_API_BASE}/courier/courierListWithCounts`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    throw new Error(`Shiprocket couriers failed: ${res.status}`)
  }
  return await res.json()
}
