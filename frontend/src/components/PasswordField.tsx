import { Eye, EyeOff } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import { useState } from "react";

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function PasswordField({ className = "", ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={`input-field w-full pr-12 ${className}`}
      />
      <button
        type="button"
        className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-kriar-muted transition hover:bg-kriar-primary/10 hover:text-kriar-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-kriar-primary/40"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={visible}
      >
        <Icon className="h-4.5 w-4.5" />
      </button>
    </div>
  );
}
