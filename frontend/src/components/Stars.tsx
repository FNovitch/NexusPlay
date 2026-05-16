import { Star } from "lucide-react";

export function Stars({ value, compact = false }: { value: number; compact?: boolean }) {
  return (
    <div className="flex items-center gap-1 text-sm text-kriar-contrast" aria-label={`${value.toFixed(1)} de 5 estrelas`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${index < Math.round(value) ? "fill-kriar-support text-kriar-support" : "text-kriar-line"}`}
        />
      ))}
      {!compact && <span className="ml-1 font-bold text-kriar-muted">{value.toFixed(1)}</span>}
    </div>
  );
}
