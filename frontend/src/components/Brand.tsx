import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="KRIAR inicio">
      <span className="grid h-11 w-11 place-items-center rounded-lg bg-kriar-primary text-kriar-paper shadow-soft">
        <Sparkles className="h-5 w-5" />
      </span>
      <span className="leading-tight">
        <strong className="block text-xl font-black tracking-normal text-kriar-primary">KRIAR</strong>
        <span className="text-xs font-semibold uppercase tracking-normal text-kriar-secondary">Arte encontra o futuro</span>
      </span>
    </Link>
  );
}
