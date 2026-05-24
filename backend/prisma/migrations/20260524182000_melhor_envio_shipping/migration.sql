CREATE TABLE "OrderShipping" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "artisanId" TEXT,
    "sellerId" TEXT,
    "originZipCode" TEXT NOT NULL,
    "destinationZipCode" TEXT NOT NULL,
    "carrier" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "deliveryTime" INTEGER NOT NULL,
    "melhorEnvioId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'QUOTED',
    "trackingCode" TEXT,
    "labelUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderShipping_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OrderShipping_orderId_idx" ON "OrderShipping"("orderId");
CREATE INDEX "OrderShipping_artisanId_idx" ON "OrderShipping"("artisanId");
CREATE INDEX "OrderShipping_sellerId_idx" ON "OrderShipping"("sellerId");
CREATE INDEX "OrderShipping_status_idx" ON "OrderShipping"("status");

ALTER TABLE "OrderShipping" ADD CONSTRAINT "OrderShipping_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderShipping" ADD CONSTRAINT "OrderShipping_artisanId_fkey" FOREIGN KEY ("artisanId") REFERENCES "Artisan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
