import { z } from "zod";

const onlyDigits = (value: string) => value.replace(/\D/g, "");
const validStates = new Set(["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"]);

function hasRepeatedDigits(value: string) {
  return /^(\d)\1+$/.test(value);
}

function isValidCpf(value: string) {
  if (value.length !== 11 || hasRepeatedDigits(value)) return false;
  const digits = value.split("").map(Number);
  const calc = (factor: number) => {
    const total = digits.slice(0, factor - 1).reduce((sum, digit, index) => sum + digit * (factor - index), 0);
    const rest = (total * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return calc(10) === digits[9] && calc(11) === digits[10];
}

function isValidCnpj(value: string) {
  if (value.length !== 14 || hasRepeatedDigits(value)) return false;
  const calc = (base: string, factors: number[]) => {
    const total = base.split("").reduce((sum, digit, index) => sum + Number(digit) * factors[index], 0);
    const rest = total % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  const first = calc(value.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const second = calc(value.slice(0, 12) + first, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return first === Number(value[12]) && second === Number(value[13]);
}

function isValidDocument(value: string) {
  return value.length === 11 ? isValidCpf(value) : value.length === 14 ? isValidCnpj(value) : false;
}

export const userRoleSchema = z.preprocess(
  (value) => (value === "SELLER" ? "ARTISAN" : value),
  z.enum(["CUSTOMER", "ARTISAN", "ADMIN"])
);
export const userTypeSchema = z.enum(["CUSTOMER", "ARTISAN", "ADMIN"]);
export const adminPermissionLevelSchema = z.enum(["SUPER_ADMIN", "MANAGER", "SUPPORT"]);

export const passwordSchema = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .max(128)
  .regex(/[A-Z]/, "A senha deve conter uma letra maiúscula")
  .regex(/[a-z]/, "A senha deve conter uma letra minúscula")
  .regex(/\d/, "A senha deve conter um número")
  .regex(/[^A-Za-z0-9]/, "A senha deve conter um caractere especial");

export const cpfSchema = z
  .string()
  .transform(onlyDigits)
  .refine(isValidCpf, "CPF inválido");

export const documentSchema = z
  .string()
  .transform(onlyDigits)
  .refine(isValidDocument, "Informe um CPF ou CNPJ válido");

export const phoneSchema = z
  .string()
  .transform(onlyDigits)
  .refine((value) => value.length === 10 || value.length === 11, "Informe um telefone brasileiro com DDD válido")
  .refine((value) => !hasRepeatedDigits(value), "Telefone inválido");

export const birthDateSchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Data de nascimento inválida");

export const addressSchema = z.object({
  street: z.string().min(2, "Rua obrigatoria").max(160),
  number: z.string().min(1).max(30),
  complement: z.string().max(120).nullish(),
  neighborhood: z.string().min(2, "Bairro obrigatorio").max(120),
  city: z.string().min(2, "Cidade obrigatoria").max(120),
  state: z.string().min(2).max(2).transform((value) => value.toUpperCase()).refine((value) => validStates.has(value), "UF inválida"),
  zipCode: z
    .string()
    .transform(onlyDigits)
    .refine((value) => value.length === 8, "CEP deve conter 8 digitos"),
  country: z.string().min(2).max(60).default("BR"),
  isDefault: z.boolean().optional()
});

export const createCustomerDTOSchema = z.object({
  name: z.string().min(3).max(120).regex(/[A-Za-zÀ-ÿ]/, "Nome deve conter letras"),
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: passwordSchema,
  birthDate: birthDateSchema,
  cpf: cpfSchema,
  phone: phoneSchema,
  address: addressSchema
});

const createArtisanBaseDTOSchema = z.object({
  name: z.string().min(3).max(120).regex(/[A-Za-zÀ-ÿ]/, "Nome deve conter letras"),
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: passwordSchema,
  cpf: cpfSchema.nullish(),
  phone: phoneSchema,
  storeName: z.string().min(3).max(90),
  storeSlug: z.string().min(2).max(120).optional(),
  storeDescription: z.string().min(10).max(3000),
  craftCategories: z.array(z.string().min(2).max(80)).min(1, "Informe pelo menos uma categoria"),
  document: documentSchema,
  address: addressSchema,
  acceptsLocalPickup: z.boolean().default(false),
  pickupInstructions: z.string().max(600).nullish()
});

export const createArtisanDTOSchema = createArtisanBaseDTOSchema.superRefine((data, ctx) => {
  if (data.acceptsLocalPickup && !data.pickupInstructions?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Informe as instrucoes de retirada",
      path: ["pickupInstructions"]
    });
  }
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

export const updateArtisanDTOSchema = createArtisanBaseDTOSchema
  .omit({ email: true, password: true, address: true })
  .partial()
  .extend({
    isDeleted: z.boolean().optional(),
    status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
    address: addressSchema.partial().optional()
  })
  .superRefine((data, ctx) => {
    if (data.acceptsLocalPickup && !data.pickupInstructions?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe as instrucoes de retirada",
        path: ["pickupInstructions"]
      });
    }
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
      artisan: createArtisanBaseDTOSchema.omit({ name: true, email: true, password: true }).optional(),
      customer: createCustomerDTOSchema.omit({ name: true, email: true, password: true }).optional(),
      admin: createAdminDTOSchema.omit({ name: true, email: true, password: true }).optional()
    })
    .superRefine((data, ctx) => {
      if (data.role === "ARTISAN" && !data.seller && !data.artisan) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Dados da loja são obrigatórios",
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

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email().transform((value) => value.toLowerCase())
  })
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      token: z.string().min(32, "Token inválido"),
      password: passwordSchema,
      confirmPassword: z.string().min(1, "Confirme a nova senha")
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A confirmação deve ser igual a nova senha",
          path: ["confirmPassword"]
        });
      }
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
