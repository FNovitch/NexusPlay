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
    <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow && <p className={`eyebrow mb-2 ${inverted ? "text-white/65" : ""}`}>{eyebrow}</p>}
        <h2 className={`text-2xl font-semibold leading-tight tracking-normal sm:text-3xl ${inverted ? "text-white" : "text-nexus-contrast"}`}>{title}</h2>
        {description && <p className={`mt-2 max-w-2xl text-sm leading-6 sm:text-base ${inverted ? "text-white/75" : "text-nexus-muted"}`}>{description}</p>}
      </div>
      {action}
    </div>
  );
}
