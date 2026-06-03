import { prisma } from "@/lib/prisma"

function deg2rad(deg: number) {
  return deg * (Math.PI / 180)
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function routeOrderToFranchise(
  productId: string,
  variantId: string | null,
  quantity: number,
  customerCity: string,
  customerPincode?: string
) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { franchise: true },
  })
  if (!product) {
    throw new Error("Product not found")
  }

  const requiredQty = quantity
  const allFranchises = await prisma.franchise.findMany({
    where: { isActive: true, isApproved: true },
    include: { productStocks: { where: { productId } } },
  })

  const mainStore = allFranchises.find((f) => f.isMainStore)
  const otherFranchises = allFranchises.filter((f) => !f.isMainStore && f.latitude && f.longitude)

  let candidateFranchises = otherFranchises
    .map((f) => {
      const stock = f.productStocks[0]
      const availableQty = stock ? stock.quantity : 0
      return {
        ...f,
        availableQty,
        hasStock: availableQty >= requiredQty,
      }
    })
    .filter((f) => f.hasStock || f.autoAcceptOrders)
    .sort((a, b) => {
      if (a.hasStock && !b.hasStock) return -1
      if (!a.hasStock && b.hasStock) return 1
      return 0
    })

  if (customerCity) {
    const cityMatch = candidateFranchises.filter(
      (f) => f.city?.toLowerCase() === customerCity.toLowerCase()
    )
    if (cityMatch.length > 0) {
      candidateFranchises = cityMatch
    }
  }

  if (candidateFranchises.length > 0) {
    const chosen = candidateFranchises[0]
    return {
      franchiseId: chosen.id,
      autoAccepted: chosen.autoAcceptOrders,
      reason: chosen.hasStock
        ? "Nearby franchise has stock"
        : "Nearby franchise auto-accepts (stock to be arranged)",
    }
  }

  if (mainStore) {
    const mainStock = mainStore.productStocks.find((ps) => ps.productId === productId)
    const mainHasStock = mainStock ? mainStock.quantity >= requiredQty : false
    if (mainHasStock) {
      return {
        franchiseId: mainStore.id,
        autoAccepted: mainStore.autoAcceptOrders,
        reason: "Main Cavree store has stock",
      }
    }
  }

  const fallback = otherFranchises.find((f) => f.autoAcceptOrders)
  if (fallback) {
    return {
      franchiseId: fallback.id,
      autoAccepted: true,
      reason: "No stock available; auto-assigned to nearest franchise",
    }
  }

  if (mainStore) {
    return {
      franchiseId: mainStore.id,
      autoAccepted: mainStore.autoAcceptOrders,
      reason: "Default to main store",
    }
  }

  throw new Error("No franchise available to fulfill this order")
}
