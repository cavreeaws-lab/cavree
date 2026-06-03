export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  role: "CUSTOMER" | "FRANCHISEE" | "SALES_EXECUTIVE" | "ADMIN" | "SUPER_ADMIN"
  phone: string | null
}

export interface Franchise {
  id: string
  name: string
  slug: string
  description: string | null
  logo: string | null
  banner: string | null
  city: string | null
  state: string | null
  isActive: boolean
  commission: number
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  children?: Category[]
  _count?: { products: number }
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  modelNumber: string | null
  productType: string | null
  shirtType: string | null
  sku: string
  brand: string | null
  barcode: string | null
  price: number
  comparePrice: number | null
  costPrice: number | null
  singlePiecePrice: number | null
  franchiseBulkPrice: number | null
  minimumQuantityLimit: number | null
  quantity: number
  weight: number | null
  dimensions: { length?: number; width?: number; height?: number } | null
  trackQuantity: boolean
  allowBackorders: boolean
  lowStockThreshold: number
  isActive: boolean
  isFeatured: boolean
  isNew: boolean
  tags: string[]
  metaTitle: string | null
  metaDescription: string | null
  category: Category
  franchise: Franchise
  images: ProductImage[]
  media?: ProductMedia[]
  variants: ProductVariant[]
  reviews?: Review[]
  _count?: { reviews: number }
}

export interface ProductMedia {
  id: string
  type: "IMAGE" | "VIDEO"
  url: string
  posterUrl: string | null
  alt: string | null
  sortOrder: number
}

export interface ProductImage {
  id: string
  url: string
  alt: string | null
  sortOrder: number
}

export interface ProductVariant {
  id: string
  size: string | null
  color: string | null
  colorCode: string | null
  sku: string
  price: number | null
  quantity: number
}

export interface CartItem {
  id: string
  quantity: number
  product: Product
  variantId: string | null
}

export interface Cart {
  id: string
  items: CartItem[]
  total: number
  itemCount: number
}

export interface Address {
  id: string
  name: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  country: string
  isDefault: boolean
  type: "HOME" | "WORK" | "OTHER"
}

export interface Order {
  id: string
  orderNumber: string
  status: string
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  couponCode: string | null
  notes: string | null
  createdAt: string
  address: Address
  items: OrderItem[]
  payment?: Payment
  shippingDetail?: Shipping
}

export interface OrderItem {
  id: string
  productId: string | null
  variantId: string | null
  name: string
  sku: string
  price: number
  quantity: number
  total: number
  size: string | null
  color: string | null
  product?: Product
}

export interface Payment {
  id: string
  amount: number
  method: string
  status: string
  transactionId: string | null
  paidAt: string | null
}

export interface Shipping {
  id: string
  status: string
  carrier: string | null
  trackingNumber: string | null
  trackingUrl: string | null
  estimatedDate: string | null
}

export interface Review {
  id: string
  rating: number
  title: string | null
  comment: string | null
  isApproved: boolean
  createdAt: string
  user: { name: string | null }
}

export interface Coupon {
  id: string
  code: string
  description: string | null
  type: string
  value: number
  minOrder: number
}

export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  totalProducts: number
  recentOrders: Order[]
  salesData: { month: string; sales: number }[]
}

export interface BulkProduct {
  id: string
  productId: string
  name: string
  slug: string
  description: string | null
  category: string
  image: string | null
  media?: any
  singlePiecePrice: number
  wholesalePrice: number
  unitSize: number
  minUnits: number
  availableUnits: number
  isActive: boolean
}

export interface Retailer {
  id: string
  businessName: string
  ownerName: string
  email: string
  phone: string
  franchiseCode: string
  status: string
  membershipTier: string
}
