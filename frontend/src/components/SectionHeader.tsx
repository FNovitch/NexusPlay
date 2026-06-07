import type { ReactNode } from "react";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: "default" | "inverted";
};

export function SectionHeader({ eyebrow, title, description, action, tone = "default" }: SectionHeaderProps) {
  const inverted = tone === "inverted";

  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className={`eyebrow mb-2 ${inverted ? "text-white/65" : ""}`}>{eyebrow}</p>}
        <h2 className={`text-2xl font-black tracking-tight sm:text-[2rem] ${inverted ? "text-white" : "text-kriar-contrast"}`}>{title}</h2>
        {description && <p className={`mt-2 max-w-2xl text-sm leading-6 sm:text-base ${inverted ? "text-white/75" : "text-kriar-muted"}`}>{description}</p>}
      </div>
      {action}
    </div>
  );
}
