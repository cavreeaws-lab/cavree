import { z } from "zod"

export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: passwordSchema,
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
})

export const profileUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  phone: z.string().optional(),
})

export const addressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Invalid phone number"),
  addressLine1: z.string().optional(),
  address: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  country: z.string().optional(),
  isDefault: z.boolean().optional(),
  type: z.string().optional(),
}).refine((data) => Boolean(data.addressLine1 || data.address), {
  message: "Address is required",
  path: ["addressLine1"],
})

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().min(1),
      variantId: z.string().optional(),
    })
  ).min(1, "At least one item is required"),
  addressId: z.string().min(1, "Address is required"),
  paymentMethod: z.enum(["RAZORPAY", "COD"]),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
  idempotencyKey: z.string().trim().min(8).max(120).optional(),
  franchiseId: z.string().optional(),
})

export const paymentCreateSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
})

export const paymentVerifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
})

export const productUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  modelNumber: z.string().optional(),
  productType: z.string().optional(),
  shirtType: z.string().optional(),
  brand: z.string().optional(),
  barcode: z.string().optional(),
  price: z.number().positive().optional(),
  compareAtPrice: z.number().optional(),
  costPrice: z.number().optional(),
  singlePiecePrice: z.number().optional(),
  franchiseBulkPrice: z.number().optional(),
  minimumQuantityLimit: z.number().int().min(0).optional(),
  sku: z.string().optional(),
  quantity: z.number().int().min(0).optional(),
  weight: z.number().optional(),
  dimensions: z.object({
    length: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  }).optional(),
  trackQuantity: z.boolean().optional(),
  allowBackorders: z.boolean().optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  categoryId: z.string().optional(),
  franchiseId: z.string().optional(),
  images: z.array(z.object({ url: z.string(), alt: z.string().optional() })).optional(),
  media: z.array(z.object({
    type: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
    url: z.string().min(1),
    posterUrl: z.string().optional(),
    alt: z.string().optional(),
  })).optional(),
  variants: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().optional(),
      value: z.string().optional(),
      size: z.string().optional(),
      color: z.string().optional(),
      colorCode: z.string().optional(),
      sku: z.string().optional(),
      price: z.number().optional(),
      quantity: z.number().int().optional(),
    })
  ).optional(),
})

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  modelNumber: z.string().optional(),
  productType: z.string().optional(),
  shirtType: z.string().optional(),
  brand: z.string().optional(),
  barcode: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  compareAtPrice: z.number().optional(),
  costPrice: z.number().optional(),
  singlePiecePrice: z.number().optional(),
  franchiseBulkPrice: z.number().optional(),
  minimumQuantityLimit: z.number().int().min(0).optional(),
  sku: z.string().min(1, "SKU is required"),
  quantity: z.number().int().min(0).optional(),
  weight: z.number().optional(),
  dimensions: z.object({
    length: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  }).optional(),
  trackQuantity: z.boolean().optional(),
  allowBackorders: z.boolean().optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  franchiseId: z.string().optional(),
  images: z.array(z.object({ url: z.string(), alt: z.string().optional() })).optional(),
  media: z.array(z.object({
    type: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
    url: z.string().min(1),
    posterUrl: z.string().optional(),
    alt: z.string().optional(),
  })).optional(),
  variants: z.array(
    z.object({
      name: z.string().optional(),
      value: z.string().optional(),
      size: z.string().optional(),
      color: z.string().optional(),
      colorCode: z.string().optional(),
      sku: z.string().optional(),
      price: z.number().optional(),
      quantity: z.number().int().optional(),
    })
  ).optional(),
})

export const orderStatusUpdateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED", "REFUNDED"]),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  trackingUrl: z.string().optional(),
  estimatedDate: z.string().or(z.date()).optional(),
  notes: z.string().optional(),
})

export const bulkOrderStatusSchema = z.object({
  orderIds: z.array(z.string().min(1)).min(1, "Select at least one order"),
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED", "REFUNDED"]),
})

export const reviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  comment: z.string().min(1, "Comment is required"),
})

export const franchiseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  isActive: z.boolean().optional(),
  ownerId: z.string().min(1, "Owner ID is required"),
  commission: z.number().optional(),
})

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: passwordSchema,
  role: z.enum(["CUSTOMER", "FRANCHISEE", "SALES_EXECUTIVE", "ADMIN", "SUPER_ADMIN"]).optional(),
  phone: z.string().optional(),
})

export const retailerSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  ownerName: z.string().min(1, "Owner name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(8, "Phone is required"),
  gstNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  categoryInterests: z.array(z.string()).optional(),
  membershipTier: z.string().optional(),
  status: z.string().optional(),
  franchiseCode: z.string().optional(),
  paymentStatus: z.string().optional(),
  agreementStatus: z.string().optional(),
  renewalStatus: z.string().optional(),
  warehouseStockValue: z.number().min(0).optional(),
  salesExecutiveId: z.string().optional(),
  franchiseId: z.string().optional(),
  notes: z.string().optional(),
})

export const salesExecutiveSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: passwordSchema.optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const bulkProductSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  productType: z.string().optional(),
  shirtType: z.string().optional(),
  modelNumber: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  image: z.string().optional(),
  media: z.any().optional(),
  singlePiecePrice: z.number().min(0).optional(),
  wholesalePrice: z.number().positive("Wholesale price is required"),
  unitSize: z.number().int().min(1).optional(),
  minUnits: z.number().int().min(1).optional(),
  availableUnits: z.number().int().min(0).optional(),
  specs: z.any().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
})

export const bulkCartItemSchema = z.object({
  productId: z.string().min(1),
  unitCount: z.number().int().min(1),
})

export const bulkCheckoutSchema = z.object({
  franchiseCode: z.string().min(1, "Franchise code is required"),
  password: z.string().min(8, "Password is required"),
  paymentMethod: z.string().min(1),
  deliveryName: z.string().optional(),
  deliveryPhone: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryCity: z.string().optional(),
  deliveryState: z.string().optional(),
  notes: z.string().optional(),
})

export const franchiseApplicationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  businessName: z.string().optional(),
  ownerName: z.string().optional(),
  email: z.string().email("Invalid email"),
  password: passwordSchema.optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
  categoryInterests: z.array(z.string()).optional(),
  membershipTier: z.string().optional(),
  investment: z.string().min(1, "Investment amount is required"),
  space: z.string().min(1, "Space details are required"),
})

export const franchiseApplicationUpdateSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  notes: z.string().optional(),
})

export const settingsUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  adminId: z.string().optional(),
  accentColor: z.string().optional(),
  theme: z.string().optional(),
  notifications: z.string().optional(),
  region: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: passwordSchema.optional(),
})

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  parentId: z.string().optional(),
})

export const couponSchema = z.object({
  code: z.string().min(1, "Code is required"),
  description: z.string().optional(),
  type: z.enum(["PERCENTAGE", "FLAT"]),
  value: z.number().positive("Value must be positive"),
  minOrder: z.number().min(0).optional(),
  maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  perCustomerLimit: z.number().int().positive().optional(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional(),
})

export const fileUploadSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  contentType: z.string().min(1, "Content type is required"),
  size: z.number().int().positive("File size is required").max(100 * 1024 * 1024, "File must be under 100MB"),
})

export const returnRequestSchema = z.object({
  orderId: z.string().min(1),
  productId: z.string().optional(),
  type: z.enum(["RETURN", "EXCHANGE"]).default("RETURN"),
  reason: z.string().min(3, "Reason is required"),
})

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, errors: result.error }
}
