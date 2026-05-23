ALTER TABLE "Product"
ADD COLUMN "variations" JSONB NOT NULL DEFAULT '[]';

ALTER TABLE "OrderItem"
ADD COLUMN "selectedVariations" JSONB;
