import type { ReactNode } from "react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="panel grid place-items-center px-6 py-14 text-center">
      {icon && <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg bg-nexus-paper text-nexus-secondary">{icon}</div>}
      <h2 className="text-2xl font-semibold leading-tight tracking-normal text-nexus-contrast">{title}</h2>
      {description && <p className="mt-2 max-w-md text-sm leading-6 text-nexus-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
