-- Catalog reset/product rebuild support. This migration is defensive because
-- production has partial schema drift from earlier backlog work.

DO $$ BEGIN
  CREATE TYPE "ProductMediaType" AS ENUM ('IMAGE', 'VIDEO');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "modelNumber" TEXT;

CREATE TABLE IF NOT EXISTS "product_media" (
  "id" TEXT NOT NULL,
  "type" "ProductMediaType" NOT NULL DEFAULT 'IMAGE',
  "url" TEXT NOT NULL,
  "posterUrl" TEXT,
  "alt" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "productId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "product_media_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "product_media_productId_sortOrder_idx" ON "product_media"("productId", "sortOrder");

DO $$ BEGIN
  ALTER TABLE "product_media"
    ADD CONSTRAINT "product_media_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "products"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "order_items"
  ALTER COLUMN "productId" DROP NOT NULL;

ALTER TABLE "order_items"
  ALTER COLUMN "variantId" DROP NOT NULL;

DO $$ BEGIN
  ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "order_items_productId_fkey";
  ALTER TABLE "order_items"
    ADD CONSTRAINT "order_items_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "products"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
END $$;

DO $$ BEGIN
  ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "order_items_variantId_fkey";
  ALTER TABLE "order_items"
    ADD CONSTRAINT "order_items_variantId_fkey"
    FOREIGN KEY ("variantId") REFERENCES "product_variants"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
END $$;

CREATE TABLE IF NOT EXISTS "banners" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "subtitle" TEXT,
  "ctaLabel" TEXT,
  "image" TEXT NOT NULL,
  "link" TEXT,
  "position" TEXT NOT NULL DEFAULT 'HOME_TOP',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "banners"
  ADD COLUMN IF NOT EXISTS "subtitle" TEXT,
  ADD COLUMN IF NOT EXISTS "ctaLabel" TEXT;

CREATE TABLE IF NOT EXISTS "recently_viewed" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "recently_viewed_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "recently_viewed_userId_productId_key" ON "recently_viewed"("userId", "productId");

DO $$ BEGIN
  ALTER TABLE "recently_viewed"
    ADD CONSTRAINT "recently_viewed_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "products"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "content_blocks" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'TEXT',
  "content" TEXT,
  "metadata" JSONB,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "content_blocks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "content_blocks_key_key" ON "content_blocks"("key");

CREATE TABLE IF NOT EXISTS "pages" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "content" TEXT,
  "metaTitle" TEXT,
  "metaDescription" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "pages_slug_key" ON "pages"("slug");

CREATE TABLE IF NOT EXISTS "activity_logs" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT,
  "details" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "email_templates" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "email_templates_key_key" ON "email_templates"("key");

CREATE TABLE IF NOT EXISTS "return_requests" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "productId" TEXT,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'RETURN',
  "reason" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "return_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "return_requests_orderId_idx" ON "return_requests"("orderId");
CREATE INDEX IF NOT EXISTS "return_requests_userId_idx" ON "return_requests"("userId");

DO $$ BEGIN
  ALTER TABLE "return_requests"
    ADD CONSTRAINT "return_requests_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "orders"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "return_requests"
    ADD CONSTRAINT "return_requests_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "products"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "invoices" (
  "id" TEXT NOT NULL,
  "invoiceNumber" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "url" TEXT,
  "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");

DO $$ BEGIN
  ALTER TABLE "invoices"
    ADD CONSTRAINT "invoices_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "orders"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "notifications" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'INFO',
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");
