-- Reference feature foundation for distinct franchise bulk, sales, warehouse,
-- retailer, and commission workflows. Written defensively for production drift.

ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SALES_EXECUTIVE';

ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "productType" TEXT,
  ADD COLUMN IF NOT EXISTS "shirtType" TEXT,
  ADD COLUMN IF NOT EXISTS "singlePiecePrice" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "franchiseBulkPrice" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "minimumQuantityLimit" INTEGER;

CREATE TABLE IF NOT EXISTS "retailers" (
  "id" TEXT NOT NULL,
  "businessName" TEXT NOT NULL,
  "ownerName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "gstNumber" TEXT,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "categoryInterests" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "membershipTier" TEXT NOT NULL DEFAULT 'STANDARD',
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "franchiseCode" TEXT NOT NULL,
  "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "agreementStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "renewalStatus" TEXT NOT NULL DEFAULT 'NOT_DUE',
  "warehouseStockValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "notes" TEXT,
  "userId" TEXT,
  "salesExecutiveId" TEXT,
  "franchiseId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "retailers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "retailers_email_key" ON "retailers"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "retailers_franchiseCode_key" ON "retailers"("franchiseCode");
CREATE UNIQUE INDEX IF NOT EXISTS "retailers_userId_key" ON "retailers"("userId");
CREATE INDEX IF NOT EXISTS "retailers_status_idx" ON "retailers"("status");
CREATE INDEX IF NOT EXISTS "retailers_salesExecutiveId_idx" ON "retailers"("salesExecutiveId");

DO $$ BEGIN
  ALTER TABLE "retailers" ADD CONSTRAINT "retailers_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "retailers" ADD CONSTRAINT "retailers_salesExecutiveId_fkey"
    FOREIGN KEY ("salesExecutiveId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "retailers" ADD CONSTRAINT "retailers_franchiseId_fkey"
    FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "bulk_products" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL,
  "image" TEXT,
  "media" JSONB,
  "singlePiecePrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "wholesalePrice" DOUBLE PRECISION NOT NULL,
  "unitSize" INTEGER NOT NULL DEFAULT 1000,
  "minUnits" INTEGER NOT NULL DEFAULT 1,
  "availableUnits" INTEGER NOT NULL DEFAULT 0,
  "specs" JSONB,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "bulk_products_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "bulk_products_productId_key" ON "bulk_products"("productId");
CREATE UNIQUE INDEX IF NOT EXISTS "bulk_products_slug_key" ON "bulk_products"("slug");
CREATE INDEX IF NOT EXISTS "bulk_products_category_isActive_idx" ON "bulk_products"("category", "isActive");

CREATE TABLE IF NOT EXISTS "bulk_product_units" (
  "id" TEXT NOT NULL,
  "unitCode" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
  "productId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "bulk_product_units_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "bulk_product_units_unitCode_key" ON "bulk_product_units"("unitCode");
CREATE INDEX IF NOT EXISTS "bulk_product_units_productId_status_idx" ON "bulk_product_units"("productId", "status");

DO $$ BEGIN
  ALTER TABLE "bulk_product_units" ADD CONSTRAINT "bulk_product_units_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "bulk_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "bulk_carts" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "bulk_carts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "bulk_carts_userId_key" ON "bulk_carts"("userId");

DO $$ BEGIN
  ALTER TABLE "bulk_carts" ADD CONSTRAINT "bulk_carts_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "bulk_cart_items" (
  "id" TEXT NOT NULL,
  "unitCount" INTEGER NOT NULL DEFAULT 1,
  "unitSize" INTEGER NOT NULL DEFAULT 1000,
  "unitPrice" DOUBLE PRECISION NOT NULL,
  "selectedUnitCodes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "total" DOUBLE PRECISION NOT NULL,
  "cartId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "bulk_cart_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "bulk_cart_items_cartId_productId_key" ON "bulk_cart_items"("cartId", "productId");

DO $$ BEGIN
  ALTER TABLE "bulk_cart_items" ADD CONSTRAINT "bulk_cart_items_cartId_fkey"
    FOREIGN KEY ("cartId") REFERENCES "bulk_carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "bulk_cart_items" ADD CONSTRAINT "bulk_cart_items_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "bulk_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "bulk_orders" (
  "id" TEXT NOT NULL,
  "orderNumber" TEXT NOT NULL,
  "franchiseCode" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "paymentMethod" TEXT,
  "subtotal" DOUBLE PRECISION NOT NULL,
  "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total" DOUBLE PRECISION NOT NULL,
  "totalUnits" INTEGER NOT NULL DEFAULT 0,
  "totalPieces" INTEGER NOT NULL DEFAULT 0,
  "deliveryName" TEXT,
  "deliveryPhone" TEXT,
  "deliveryAddress" TEXT,
  "deliveryCity" TEXT,
  "deliveryState" TEXT,
  "notes" TEXT,
  "userId" TEXT NOT NULL,
  "retailerId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "bulk_orders_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "bulk_orders_orderNumber_key" ON "bulk_orders"("orderNumber");
CREATE INDEX IF NOT EXISTS "bulk_orders_franchiseCode_idx" ON "bulk_orders"("franchiseCode");
CREATE INDEX IF NOT EXISTS "bulk_orders_status_idx" ON "bulk_orders"("status");

DO $$ BEGIN
  ALTER TABLE "bulk_orders" ADD CONSTRAINT "bulk_orders_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "bulk_orders" ADD CONSTRAINT "bulk_orders_retailerId_fkey"
    FOREIGN KEY ("retailerId") REFERENCES "retailers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "bulk_order_items" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "productCode" TEXT NOT NULL,
  "unitCount" INTEGER NOT NULL,
  "unitSize" INTEGER NOT NULL,
  "unitPrice" DOUBLE PRECISION NOT NULL,
  "total" DOUBLE PRECISION NOT NULL,
  "selectedUnitCodes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "orderId" TEXT NOT NULL,
  "productId" TEXT,
  CONSTRAINT "bulk_order_items_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "bulk_order_items" ADD CONSTRAINT "bulk_order_items_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "bulk_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "bulk_order_items" ADD CONSTRAINT "bulk_order_items_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "bulk_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "bulk_order_timeline" (
  "id" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "orderId" TEXT NOT NULL,
  CONSTRAINT "bulk_order_timeline_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "bulk_order_timeline_orderId_idx" ON "bulk_order_timeline"("orderId");

DO $$ BEGIN
  ALTER TABLE "bulk_order_timeline" ADD CONSTRAINT "bulk_order_timeline_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "bulk_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "franchise_agreements" (
  "id" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "feeAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "feeStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "startsAt" TIMESTAMP(3),
  "renewsAt" TIMESTAMP(3),
  "documentUrl" TEXT,
  "notes" TEXT,
  "franchiseId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "franchise_agreements_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "franchise_agreements_franchiseId_status_idx" ON "franchise_agreements"("franchiseId", "status");

DO $$ BEGIN
  ALTER TABLE "franchise_agreements" ADD CONSTRAINT "franchise_agreements_franchiseId_fkey"
    FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "warehouses" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "city" TEXT,
  "state" TEXT,
  "address" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "franchiseId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_franchiseId_fkey"
    FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "warehouse_coordinators" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "warehouseId" TEXT,
  "userId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "warehouse_coordinators_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "warehouse_coordinators_status_idx" ON "warehouse_coordinators"("status");

DO $$ BEGIN
  ALTER TABLE "warehouse_coordinators" ADD CONSTRAINT "warehouse_coordinators_warehouseId_fkey"
    FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "warehouse_coordinators" ADD CONSTRAINT "warehouse_coordinators_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "stock_movements" (
  "id" TEXT NOT NULL,
  "productCode" TEXT,
  "productName" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "type" TEXT NOT NULL,
  "reason" TEXT,
  "createdBy" TEXT,
  "warehouseId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "stock_movements_type_idx" ON "stock_movements"("type");

DO $$ BEGIN
  ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_warehouseId_fkey"
    FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "commission_rules" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "rate" DOUBLE PRECISION NOT NULL,
  "appliesTo" TEXT NOT NULL DEFAULT 'FRANCHISE',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "franchiseId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "commission_rules_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "commission_rules" ADD CONSTRAINT "commission_rules_franchiseId_fkey"
    FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "commission_credits" (
  "id" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "rate" DOUBLE PRECISION NOT NULL,
  "source" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "notes" TEXT,
  "ruleId" TEXT,
  "retailerId" TEXT,
  "userId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "commission_credits_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "commission_credits_status_idx" ON "commission_credits"("status");

DO $$ BEGIN
  ALTER TABLE "commission_credits" ADD CONSTRAINT "commission_credits_ruleId_fkey"
    FOREIGN KEY ("ruleId") REFERENCES "commission_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "commission_credits" ADD CONSTRAINT "commission_credits_retailerId_fkey"
    FOREIGN KEY ("retailerId") REFERENCES "retailers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "commission_credits" ADD CONSTRAINT "commission_credits_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
