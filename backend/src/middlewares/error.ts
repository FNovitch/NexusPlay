import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const notFound: RequestHandler = (req, _res, next) => {
  next(new AppError(`Rota nao encontrada: ${req.originalUrl}`, 404));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(422).json({
      message: "Dados invalidos",
      issues: err.flatten()
    });
  }

  const status = err.statusCode ?? 500;
  return res.status(status).json({
    message: status === 500 ? "Erro interno no servidor" : err.message,
    details: process.env.NODE_ENV === "development" ? err.message : undefined
  });
};
