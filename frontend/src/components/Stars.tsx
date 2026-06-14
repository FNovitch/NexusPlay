import { Star } from "lucide-react";

export function Stars({ value, compact = false }: { value: number; compact?: boolean }) {
  return (
    <div className="flex items-center gap-1 text-sm text-nexus-contrast" aria-label={`${value.toFixed(1)} de 5 estrelas`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${index < Math.round(value) ? "fill-nexus-support text-nexus-support" : "text-nexus-line"}`}
        />
      ))}
      {!compact && <span className="ml-1 font-bold text-nexus-muted">{value.toFixed(1)}</span>}
    </div>
  );
}
