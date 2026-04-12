type StateVariant = "empty" | "info" | "success" | "warning" | "error" | "loading";

interface StatePanelProps {
  title: string;
  description: string;
  variant?: StateVariant;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

function variantClassName(variant: StateVariant): string {
  switch (variant) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "error":
      return "border-rose-200 bg-rose-50 text-rose-900";
    case "loading":
      return "border-sky-200 bg-sky-50 text-sky-900";
    case "info":
      return "border-slate-200 bg-slate-50 text-slate-800";
    case "empty":
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export default function StatePanel({
  title,
  description,
  variant = "info",
  actionLabel,
  onAction,
  compact = false
}: StatePanelProps): JSX.Element {
  return (
    <div
      className={`rounded-xl border px-4 py-3 ${variantClassName(variant)} ${
        compact ? "text-sm" : "text-base"
      }`}
      role={variant === "error" ? "alert" : "status"}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`${compact ? "text-sm" : "text-base"} font-semibold`}>{title}</p>
          <p className={`${compact ? "text-xs" : "text-sm"} mt-1 opacity-90`}>{description}</p>
        </div>
        {variant === "loading" ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
      </div>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-3 rounded-md border border-current/40 px-2.5 py-1 text-xs font-medium hover:bg-white/40"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
