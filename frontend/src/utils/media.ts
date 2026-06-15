import type React from "react";
import { backendOrigin } from "../config/env";

export const imagePlaceholder = "/brand/image-placeholder.svg";

export function resolveImageUrl(url?: string | null) {
  if (!url || !url.trim()) return imagePlaceholder;
  const value = url.trim();
  if (value.startsWith("/uploads") || value.startsWith("uploads/")) {
    const path = value.startsWith("/") ? value : `/${value}`;
    return `${backendOrigin}${path}`;
  }
  if (/^[a-z][a-z\d+.-]*:/i.test(value) || value.startsWith("/")) return value;
  return `/${value}`;
}

export function handleImageError(event: React.SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget;
  if (image.src.endsWith(imagePlaceholder)) return;
  image.src = imagePlaceholder;
}
