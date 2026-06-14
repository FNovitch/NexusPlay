-- CreateEnum
CREATE TYPE "SubscriptionPlanType" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "ArtisanSubscriptionStatus" AS ENUM ('TRIAL_ACTIVE', 'ACTIVE', 'EXPIRED', 'CANCELED', 'PENDING', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentHistoryType" AS ENUM ('ARTISAN_SUBSCRIPTION', 'CUSTOMER_PURCHASE', 'ARTISAN_PAYOUT');

-- CreateEnum
CREATE TYPE "SellerPayoutStatus" AS ENUM ('BLOCKED', 'AVAILABLE', 'PAID', 'CANCELED');

-- AlterTable
ALTER TABLE "Artisan" ADD COLUMN "subscriptionActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "trialStart" TIMESTAMP(3),
ADD COLUMN "trialEnd" TIMESTAMP(3),
ADD COLUMN "subscriptionExpiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "paymentReleasedToArtisan" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "customerConfirmedDelivery" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "deliveryConfirmedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "type" "SubscriptionPlanType" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtisanSubscription" (
    "id" TEXT NOT NULL,
    "artisanId" TEXT NOT NULL,
    "planId" TEXT,
    "status" "ArtisanSubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "trialStart" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "mpPreferenceId" TEXT,
    "mpPaymentId" TEXT,
    "mpStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArtisanSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentHistory" (
    "id" TEXT NOT NULL,
    "artisanId" TEXT,
    "customerId" TEXT,
    "orderId" TEXT,
    "subscriptionId" TEXT,
    "type" "PaymentHistoryType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL,
    "mpPaymentId" TEXT,
    "mpPreferenceId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerPayout" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "artisanId" TEXT NOT NULL,
    "saleAmount" DECIMAL(10,2) NOT NULL,
    "shippingAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "availableAmount" DECIMAL(10,2) NOT NULL,
    "status" "SellerPayoutStatus" NOT NULL DEFAULT 'BLOCKED',
    "releasedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerPayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_type_key" ON "SubscriptionPlan"("type");

-- CreateIndex
CREATE INDEX "ArtisanSubscription_artisanId_idx" ON "ArtisanSubscription"("artisanId");

-- CreateIndex
CREATE INDEX "ArtisanSubscription_status_idx" ON "ArtisanSubscription"("status");

-- CreateIndex
CREATE INDEX "ArtisanSubscription_expirationDate_idx" ON "ArtisanSubscription"("expirationDate");

-- CreateIndex
CREATE INDEX "PaymentHistory_artisanId_idx" ON "PaymentHistory"("artisanId");

-- CreateIndex
CREATE INDEX "PaymentHistory_customerId_idx" ON "PaymentHistory"("customerId");

-- CreateIndex
CREATE INDEX "PaymentHistory_orderId_idx" ON "PaymentHistory"("orderId");

-- CreateIndex
CREATE INDEX "PaymentHistory_subscriptionId_idx" ON "PaymentHistory"("subscriptionId");

-- CreateIndex
CREATE INDEX "PaymentHistory_type_idx" ON "PaymentHistory"("type");

-- CreateIndex
CREATE UNIQUE INDEX "SellerPayout_orderId_artisanId_key" ON "SellerPayout"("orderId", "artisanId");

-- CreateIndex
CREATE INDEX "SellerPayout_artisanId_idx" ON "SellerPayout"("artisanId");

-- CreateIndex
CREATE INDEX "SellerPayout_status_idx" ON "SellerPayout"("status");

-- AddForeignKey
ALTER TABLE "ArtisanSubscription" ADD CONSTRAINT "ArtisanSubscription_artisanId_fkey" FOREIGN KEY ("artisanId") REFERENCES "Artisan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtisanSubscription" ADD CONSTRAINT "ArtisanSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentHistory" ADD CONSTRAINT "PaymentHistory_artisanId_fkey" FOREIGN KEY ("artisanId") REFERENCES "Artisan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentHistory" ADD CONSTRAINT "PaymentHistory_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentHistory" ADD CONSTRAINT "PaymentHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentHistory" ADD CONSTRAINT "PaymentHistory_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "ArtisanSubscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerPayout" ADD CONSTRAINT "SellerPayout_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerPayout" ADD CONSTRAINT "SellerPayout_artisanId_fkey" FOREIGN KEY ("artisanId") REFERENCES "Artisan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed subscription plans
INSERT INTO "SubscriptionPlan" ("id", "name", "description", "price", "durationDays", "type", "active", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'Plano mensal', 'Assinatura mensal para continuar vendendo na NexusPlay.', 9.90, 30, 'MONTHLY', true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Plano anual', 'Assinatura anual com desconto para continuar vendendo na NexusPlay.', 99.00, 365, 'YEARLY', true, CURRENT_TIMESTAMP)
ON CONFLICT ("type") DO NOTHING;

-- Backfill trial for existing artisans that do not have trial dates yet.
UPDATE "Artisan"
SET "trialStart" = COALESCE("trialStart", "createdAt"),
    "trialEnd" = COALESCE("trialEnd", "createdAt" + INTERVAL '7 days')
WHERE "trialStart" IS NULL OR "trialEnd" IS NULL;
