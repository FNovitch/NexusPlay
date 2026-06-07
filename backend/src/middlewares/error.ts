import type { ErrorRequestHandler, RequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export class AppError extends Error {
  statusCode: number;
  errors?: Record<string, string>;

  constructor(message: string, statusCode = 400, errors?: Record<string, string>) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export const notFound: RequestHandler = (req, _res, next) => {
  next(new AppError(`Rota nao encontrada: ${req.originalUrl}`, 404));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (process.env.NODE_ENV === "development" || process.env.PRODUCT_DEBUG === "true") {
    console.error("[api:error]", {
      name: err?.name,
      code: err?.code,
      message: err?.message,
      meta: err?.meta,
      stack: err?.stack
    });
  }

  if (err instanceof ZodError) {
    const errors = err.issues.reduce<Record<string, string>>((acc, issue) => {
      const path = issue.path.filter((part) => part !== "body" && part !== "query" && part !== "params").join(".");
      acc[path || "form"] = issue.message;
      return acc;
    }, {});

    return res.status(400).json({
      success: false,
      message: "Dados invalidos",
      errors
    });
  }

  if (err?.name === "MulterError") {
    const uploadErrors: Record<string, string> = {
      LIMIT_FILE_COUNT: "Maximo de 3 imagens permitidas.",
      LIMIT_UNEXPECTED_FILE: "Maximo de 3 imagens permitidas.",
      LIMIT_FILE_SIZE: "Cada imagem deve ter no maximo 5MB.",
    };
    const message = uploadErrors[String(err.code)] ?? "Falha ao enviar imagem.";

    return res.status(400).json({
      success: false,
      message,
      errors: { images: message }
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const fields = Array.isArray(err.meta?.target) ? err.meta.target.map(String) : ["form"];
      const errors = fields.reduce<Record<string, string>>((acc, field) => {
        acc[field] = "Valor ja cadastrado.";
        return acc;
      }, {});

      return res.status(409).json({
        success: false,
        message: "Nao foi possivel concluir o cadastro.",
        errors
      });
    }

    if (err.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: "Referencia invalida para concluir a operacao.",
        errors: { form: "Verifique os dados relacionados e tente novamente." }
      });
    }

    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Recurso nao encontrado.",
        errors: { form: "O registro solicitado nao foi encontrado." }
      });
    }
  }

  const status = err.statusCode ?? 500;
  return res.status(status).json({
    success: false,
    message: status === 500 ? "Erro interno no servidor" : err.message,
    errors: err.errors,
    details: process.env.NODE_ENV === "development" ? err.message : undefined
  });
};
