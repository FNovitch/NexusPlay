ALTER TABLE "Artisan"
ADD COLUMN "craftCategories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "acceptsLocalPickup" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "pickupInstructions" TEXT,
ADD COLUMN "status" "SellerStatus" NOT NULL DEFAULT 'PENDING';
