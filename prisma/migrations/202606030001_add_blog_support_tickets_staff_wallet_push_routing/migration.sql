-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "FranchiseStaffRole" AS ENUM ('MANAGER', 'STAFF', 'ACCOUNTANT', 'INVENTORY_MANAGER');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'FRANCHISE_STAFF';

-- DropForeignKey
ALTER TABLE "recently_viewed" DROP CONSTRAINT "recently_viewed_productId_fkey";

-- AlterTable
ALTER TABLE "bulk_cart_items" ALTER COLUMN "selectedUnitCodes" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "bulk_carts" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "bulk_order_items" ALTER COLUMN "selectedUnitCodes" DROP DEFAULT;

-- AlterTable
ALTER TABLE "bulk_orders" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "bulk_product_units" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "bulk_products" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "commission_credits" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "commission_rules" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "email_templates" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "franchise_agreements" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "franchises" ADD COLUMN     "autoAcceptOrders" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isMainStore" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "originalFranchiseId" TEXT,
ADD COLUMN     "routedAt" TIMESTAMP(3),
ADD COLUMN     "routingReason" TEXT;

-- AlterTable
ALTER TABLE "pages" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "retailers" ALTER COLUMN "categoryInterests" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "return_requests" ADD COLUMN     "arbitratedAt" TIMESTAMP(3),
ADD COLUMN     "arbitratedBy" TEXT,
ADD COLUMN     "arbitrationDecision" TEXT,
ADD COLUMN     "arbitrationNote" TEXT;

-- AlterTable
ALTER TABLE "shipping" ADD COLUMN     "shiprocketCourierName" TEXT,
ADD COLUMN     "shiprocketEwayBillNumber" TEXT,
ADD COLUMN     "shiprocketOrderId" TEXT,
ADD COLUMN     "shiprocketShipmentId" TEXT,
ADD COLUMN     "shiprocketTrackingUrl" TEXT;

-- AlterTable
ALTER TABLE "warehouse_coordinators" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "warehouses" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "stock_adjustments" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_notes" (
    "id" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "orderId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "commission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "method" TEXT,
    "accountDetails" JSONB,
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT,
    "coverImage" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_messages" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "senderType" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "attachments" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ticketId" TEXT NOT NULL,

    CONSTRAINT "ticket_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "franchise_staff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" "FranchiseStaffRole" NOT NULL DEFAULT 'STAFF',
    "permissions" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "franchise_staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "franchise_wallet_transactions" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "franchiseId" TEXT NOT NULL,

    CONSTRAINT "franchise_wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_franchise_stocks" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productId" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,

    CONSTRAINT "product_franchise_stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_shipping_configs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "zones" JSONB,
    "freeShippingThreshold" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "franchiseId" TEXT NOT NULL,

    CONSTRAINT "vendor_shipping_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blog_categories_slug_key" ON "blog_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_isPublished_publishedAt_idx" ON "blog_posts"("isPublished", "publishedAt");

-- CreateIndex
CREATE INDEX "support_tickets_userId_status_idx" ON "support_tickets"("userId", "status");

-- CreateIndex
CREATE INDEX "support_tickets_orderId_idx" ON "support_tickets"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "franchise_staff_userId_key" ON "franchise_staff"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "franchise_staff_franchiseId_email_key" ON "franchise_staff"("franchiseId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_userId_endpoint_key" ON "push_subscriptions"("userId", "endpoint");

-- CreateIndex
CREATE UNIQUE INDEX "product_franchise_stocks_productId_franchiseId_key" ON "product_franchise_stocks"("productId", "franchiseId");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_shipping_configs_franchiseId_key" ON "vendor_shipping_configs"("franchiseId");

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recently_viewed" ADD CONSTRAINT "recently_viewed_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "blog_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "franchise_staff" ADD CONSTRAINT "franchise_staff_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "franchise_staff" ADD CONSTRAINT "franchise_staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "franchise_wallet_transactions" ADD CONSTRAINT "franchise_wallet_transactions_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_franchise_stocks" ADD CONSTRAINT "product_franchise_stocks_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_franchise_stocks" ADD CONSTRAINT "product_franchise_stocks_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_shipping_configs" ADD CONSTRAINT "vendor_shipping_configs_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

