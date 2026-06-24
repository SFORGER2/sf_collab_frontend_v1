import { X, CheckCircle, AlertCircle, Info } from "lucide-react"
import { cn } from "../../lib/utils"
import type { Toast, ToastVariant } from "../../hooks/use-toast"

const iconMap: Record<ToastVariant, typeof CheckCircle> = {
  default: Info,
  success: CheckCircle,
  destructive: AlertCircle,
  info: Info,
}

const variantStyles: Record<ToastVariant, string> = {
  default:
    "border-border/60 bg-nav/80 backdrop-blur-md text-card-foreground shadow-lg shadow-black/5",
  success:
    "border-success/30 bg-success/10 backdrop-blur-md text-success shadow-lg shadow-success/5",
  destructive:
    "border-destructive/30 bg-destructive/10 backdrop-blur-md text-destructive shadow-lg shadow-destructive/5",
  info:
    "border-primary/30 bg-primary/10 backdrop-blur-md text-primary shadow-lg shadow-primary/5",
}

interface ToastItemProps {
  toast: Toast
  onDismiss: (id: string) => void
}

export function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const variant: ToastVariant = toast.variant ?? "default"
  const Icon = iconMap[variant]

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 min-w-[320px] max-w-[420px]",
        variantStyles[variant],
      )}
    >
      <Icon className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={1.5} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-muted-foreground/80 mt-0.5 leading-relaxed">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded-md p-1 opacity-40 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200 cursor-pointer"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
