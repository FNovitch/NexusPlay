import { z } from "zod";

export const productStatusSchema = z.enum(["ACTIVE", "INACTIVE", "SOLD_OUT", "PENDING"]);

export const productImageSchema = z.object({
  url: z.string().url(),
  filename: z.string().min(1).max(180),
  alt: z.string().min(1).max(180)
});

export const productDimensionsSchema = z.object({
  width: z.coerce.number().positive(),
  height: z.coerce.number().positive(),
  length: z.coerce.number().positive()
});

export const productVariationSchema = z.object({
  name: z.string().min(2).max(60),
  options: z.array(z.string().min(1).max(60)).min(1).max(12)
});

const jsonArray = <T extends z.ZodTypeAny>(schema: T, max = 99) =>
  z.preprocess((value) => {
    if (typeof value !== "string") return value;
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }, z.array(schema).max(max));

export const createProductDTOSchema = z.object({
  name: z.string().min(3).max(140),
  description: z.string().min(10).max(5000),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0),
  category: z.string().min(1).max(120),
  categoryId: z.string().uuid(),
  images: z.array(productImageSchema).min(1).max(3).optional(),
  variations: jsonArray(productVariationSchema, 8).optional(),
  dimensions: productDimensionsSchema.nullish(),
  weight: z.coerce.number().min(0).optional(),
  shippingAvailable: z.coerce.boolean().optional(),
  pickupAvailable: z.coerce.boolean().optional(),
  pickupAddress: z.string().max(300).nullish(),
  customizationAvailable: z.coerce.boolean().optional(),
  personalizationPrompt: z.string().max(500).nullish()
});

export const updateProductDTOSchema = createProductDTOSchema.partial().extend({
  status: productStatusSchema.optional()
});

export const createProductSchema = z.object({
  body: createProductDTOSchema
});

export const updateProductSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: updateProductDTOSchema
});

export type CreateProductDTO = z.infer<typeof createProductDTOSchema>;
export type UpdateProductDTO = z.infer<typeof updateProductDTOSchema>;
