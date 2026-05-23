ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'PENDING';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'AWAITING_PAYMENT';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'CANCELED';

ALTER TABLE "Order"
ADD COLUMN "orderCode" TEXT NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN "paymentMethod" TEXT,
ADD COLUMN "productsTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "shippingTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "shippingAddress" JSONB,
ADD COLUMN "mpStatus" TEXT;

CREATE UNIQUE INDEX "Order_orderCode_key" ON "Order"("orderCode");

ALTER TABLE "OrderItem"
ADD COLUMN "productName" TEXT NOT NULL DEFAULT '',
ADD COLUMN "productImage" TEXT;

CREATE TABLE "OrderHistory" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "previousStatus" "OrderStatus",
  "newStatus" "OrderStatus" NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OrderHistory_orderId_idx" ON "OrderHistory"("orderId");

ALTER TABLE "OrderHistory"
ADD CONSTRAINT "OrderHistory_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
