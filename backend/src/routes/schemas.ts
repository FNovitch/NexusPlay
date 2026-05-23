import { ProductStatus, SellerStatus } from "@prisma/client";
import { z } from "zod";
import {
  createProductSchema as productSchema,
  updateProductSchema
} from "../modules/products/product.schema.js";
import {
  createArtisanSchema as registerArtisanSchema,
  createCustomerSchema as registerCustomerSchema,
  legacyRegisterSchema as registerSchema,
  loginSchema,
  updateArtisanSchema as artisanUpdateSchema,
  updateCustomerSchema as customerUpdateSchema
} from "../modules/users/user.schema.js";

export { artisanUpdateSchema, customerUpdateSchema, loginSchema, productSchema, registerArtisanSchema, registerCustomerSchema, registerSchema, updateProductSchema };

const url = z.string().url().optional().or(z.literal(""));

export const productQuerySchema = z.object({
  query: z.object({
    q: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    rating: z.coerce.number().min(1).max(5).optional(),
    sort: z.enum(["featured", "price_asc", "price_desc", "best_sellers"]).optional()
  })
});

export const sellerUpdateSchema = z.object({
  body: z.object({
    storeName: z.string().min(2).max(90).optional(),
    bio: z.string().min(10).max(240).optional(),
    story: z.string().min(30).max(3000).optional(),
    avatarUrl: url,
    coverUrl: url
  })
});

export const checkoutSchema = z.object({
  body: z.object({
    shippingAddress: z.unknown().optional(),
    enderecoEntrega: z.unknown().optional(),
    shippingTotal: z.coerce.number().min(0).optional(),
    valorFrete: z.coerce.number().min(0).optional(),
    items: z
      .array(
        z.object({
          productId: z.string().uuid(),
            quantity: z.number().int().min(1).max(99),
            customizationNotes: z.string().max(500).optional(),
            selectedVariations: z.record(z.string()).optional()
              })
      )
      .min(1, "Carrinho vazio.")
  })
});

export const reviewSchema = z.object({
  body: z
    .object({
      productId: z.string().uuid().optional(),
      sellerId: z.string().uuid().optional(),
      orderItemId: z.string().uuid(),
      type: z.enum(["PRODUCT", "SELLER"]).optional(),
      rating: z.number().int().min(1).max(5),
      comment: z.string().min(5).max(1000)
    })
});

export const moderateSellerSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ status: z.nativeEnum(SellerStatus) })
});

export const moderateProductSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ status: z.nativeEnum(ProductStatus) })
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string().uuid() })
});

export const productIdParamSchema = z.object({
  params: z.object({ productId: z.string().uuid() })
});
