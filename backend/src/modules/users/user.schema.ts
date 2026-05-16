import { z } from "zod";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

export const userRoleSchema = z.preprocess(
  (value) => (value === "SELLER" ? "ARTISAN" : value),
  z.enum(["CUSTOMER", "ARTISAN", "ADMIN"])
);
export const userTypeSchema = z.enum(["CUSTOMER", "ARTISAN", "ADMIN"]);
export const adminPermissionLevelSchema = z.enum(["SUPER_ADMIN", "MANAGER", "SUPPORT"]);

export const passwordSchema = z.string().min(8).max(128);

export const cpfSchema = z
  .string()
  .transform(onlyDigits)
  .refine((value) => value.length === 11, "CPF deve conter 11 digitos");

export const documentSchema = z
  .string()
  .transform(onlyDigits)
  .refine((value) => value.length === 11 || value.length === 14, "Documento deve conter CPF ou CNPJ valido");

export const phoneSchema = z
  .string()
  .transform(onlyDigits)
  .refine((value) => value.length >= 10 && value.length <= 13, "Telefone invalido");

export const birthDateSchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Data de nascimento invalida");

export const addressSchema = z.object({
  street: z.string().min(2).max(160),
  number: z.string().min(1).max(30),
  complement: z.string().max(120).nullish(),
  neighborhood: z.string().min(2).max(120),
  city: z.string().min(2).max(120),
  state: z.string().min(2).max(2).transform((value) => value.toUpperCase()),
  zipCode: z
    .string()
    .transform(onlyDigits)
    .refine((value) => value.length === 8, "CEP deve conter 8 digitos"),
  country: z.string().min(2).max(60).default("BR"),
  isDefault: z.boolean().optional()
});

export const createCustomerDTOSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: passwordSchema,
  birthDate: birthDateSchema,
  cpf: cpfSchema,
  phone: phoneSchema,
  address: addressSchema
});

export const createArtisanDTOSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: passwordSchema,
  cpf: cpfSchema.nullish(),
  phone: phoneSchema,
  storeName: z.string().min(2).max(90),
  storeSlug: z.string().min(2).max(120).optional(),
  storeDescription: z.string().min(10).max(3000),
  document: documentSchema,
  address: addressSchema
});

export const createAdminDTOSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: passwordSchema,
  permissionLevel: adminPermissionLevelSchema
});

export const updateCustomerDTOSchema = createCustomerDTOSchema
  .omit({ email: true, password: true, address: true })
  .partial()
  .extend({
    isDeleted: z.boolean().optional(),
    address: addressSchema.partial().optional()
  });

export const updateArtisanDTOSchema = createArtisanDTOSchema
  .omit({ email: true, password: true, address: true })
  .partial()
  .extend({
    isDeleted: z.boolean().optional(),
    address: addressSchema.partial().optional()
  });

export const updateAdminDTOSchema = createAdminDTOSchema.omit({ email: true, password: true }).partial().extend({
  isDeleted: z.boolean().optional()
});

export const legacyRegisterSchema = z.object({
  body: z
    .object({
      name: z.string().min(2).max(120),
      email: z.string().email().transform((value) => value.toLowerCase()),
      password: passwordSchema,
      role: userRoleSchema.optional(),
      seller: z
        .object({
          storeName: z.string().min(2).max(90),
          bio: z.string().min(10).max(240),
          story: z.string().min(10).max(3000),
          avatarUrl: z.string().url().optional().or(z.literal("")),
          coverUrl: z.string().url().optional().or(z.literal(""))
        })
        .optional(),
      artisan: createArtisanDTOSchema.omit({ name: true, email: true, password: true }).optional(),
      customer: createCustomerDTOSchema.omit({ name: true, email: true, password: true }).optional(),
      admin: createAdminDTOSchema.omit({ name: true, email: true, password: true }).optional()
    })
    .superRefine((data, ctx) => {
      if (data.role === "ARTISAN" && !data.seller && !data.artisan) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Dados da loja/artesao sao obrigatorios",
          path: ["artisan"]
        });
      }

      if (data.role === "ADMIN" && !data.admin) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "permissionLevel e obrigatorio para administrador",
          path: ["admin"]
        });
      }
    })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email().transform((value) => value.toLowerCase()),
    password: z.string().min(1)
  })
});

export const createCustomerSchema = z.object({ body: createCustomerDTOSchema });
export const createArtisanSchema = z.object({ body: createArtisanDTOSchema });
export const createAdminSchema = z.object({ body: createAdminDTOSchema });
export const updateCustomerSchema = z.object({ body: updateCustomerDTOSchema });
export const updateArtisanSchema = z.object({ body: updateArtisanDTOSchema });
export const updateAdminSchema = z.object({ body: updateAdminDTOSchema });

export type CreateCustomerDTO = z.infer<typeof createCustomerDTOSchema>;
export type CreateArtisanDTO = z.infer<typeof createArtisanDTOSchema>;
export type CreateAdminDTO = z.infer<typeof createAdminDTOSchema>;
