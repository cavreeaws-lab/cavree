-- Full audit backlog foundation: catalog metadata, coupon usage, returns, invoices, notifications.

ALTER TABLE "products"
  ADD COLUMN "brand" TEXT,
  ADD COLUMN "barcode" TEXT,
  ADD COLUMN "dimensions" JSONB,
  ADD COLUMN "trackQuantity" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "allowBackorders" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "lowStockThreshold" INTEGER NOT NULL DEFAULT 5;

ALTER TABLE "coupons"
  ADD COLUMN "perCustomerLimit" INTEGER;

CREATE TABLE "coupon_usages" (
  "id" TEXT NOT NULL,
  "couponId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "orderId" TEXT,
  "discount" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "coupon_usages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "return_requests" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "productId" TEXT,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'RETURN',
  "reason" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "return_requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "invoices" (
  "id" TEXT NOT NULL,
  "invoiceNumber" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "url" TEXT,
  "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notifications" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'INFO',
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "coupon_usages_couponId_userId_idx" ON "coupon_usages"("couponId", "userId");
CREATE INDEX "return_requests_orderId_idx" ON "return_requests"("orderId");
CREATE INDEX "return_requests_userId_idx" ON "return_requests"("userId");
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
