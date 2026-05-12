import type { NextFunction, Request, Response } from "express";

const dangerousPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

function clean(value: unknown): unknown {
  if (typeof value === "string") {
    return value.replace(dangerousPattern, "").trim();
  }

  if (Array.isArray(value)) {
    return value.map(clean);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clean(item)]));
  }

  return value;
}

export function sanitizeInput(req: Request, _res: Response, next: NextFunction) {
  req.body = clean(req.body);
  req.query = clean(req.query) as Request["query"];
  next();
}
