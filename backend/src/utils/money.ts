import { Prisma } from "@prisma/client";

export function toDecimal(value: number | string | Prisma.Decimal) {
  return new Prisma.Decimal(value);
}

export function decimalToNumber(value: Prisma.Decimal | number) {
  return typeof value === "number" ? value : Number(value.toFixed(2));
}
