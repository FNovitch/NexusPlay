import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { useToast, type ToastVariant } from "../store/toast";

const iconByVariant: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  info: Info,
  warning: TriangleAlert
};

export function ToastViewport() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] grid w-[calc(100vw-2rem)] max-w-sm gap-3 sm:bottom-6 sm:right-6">
      {toasts.map((toast) => {
        const Icon = iconByVariant[toast.variant ?? "info"];

        return (
          <div key={toast.id} className="panel flex items-start gap-3 p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-nexus-paper text-nexus-secondary">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <strong className="block text-sm text-nexus-contrast">{toast.title}</strong>
              {toast.description && <p className="mt-1 text-sm leading-5 text-nexus-muted">{toast.description}</p>}
            </div>
            <button onClick={() => dismiss(toast.id)} className="rounded-lg p-1 text-nexus-muted hover:bg-nexus-paper hover:text-nexus-contrast" aria-label="Fechar aviso">
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
