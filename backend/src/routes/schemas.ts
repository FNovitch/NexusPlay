import { ProductStatus, SellerStatus, UserRole } from "@prisma/client";
import { z } from "zod";

const url = z.string().url().optional().or(z.literal(""));

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    email: z.string().email(),
    password: z.string().min(8).max(128),
    role: z.nativeEnum(UserRole).optional(),
    seller: z
      .object({
        storeName: z.string().min(2).max(90),
        bio: z.string().min(10).max(240),
        story: z.string().min(30).max(3000),
        avatarUrl: url,
        coverUrl: url
      })
      .optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  })
});

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

export const productSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid(),
    name: z.string().min(3).max(140),
    description: z.string().min(20).max(5000),
    price: z.coerce.number().positive(),
    stock: z.coerce.number().int().min(0),
    images: z.array(z.string().url()).min(1).max(8),
    customizationAvailable: z.boolean().optional(),
    personalizationPrompt: z.string().max(500).optional()
  })
});

export const updateProductSchema = productSchema.deepPartial().extend({
  params: z.object({ id: z.string().uuid() })
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
    items: z
      .array(
        z.object({
          productId: z.string().uuid(),
          quantity: z.number().int().min(1).max(99),
          customizationNotes: z.string().max(500).optional()
        })
      )
      .min(1)
  })
});

export const reviewSchema = z.object({
  body: z
    .object({
      productId: z.string().uuid().optional(),
      sellerId: z.string().uuid().optional(),
      orderItemId: z.string().uuid().optional(),
      type: z.enum(["PRODUCT", "SELLER"]),
      rating: z.number().int().min(1).max(5),
      comment: z.string().min(5).max(1000)
    })
    .refine((data) => data.productId || data.sellerId, "Informe productId ou sellerId")
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
