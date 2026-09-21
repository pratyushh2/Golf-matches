import type { ReactNode } from "react";

export const Panel = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={`rounded-xl border border-white/10 bg-white/[0.02] p-6 ${className}`}>
    {children}
  </div>
);

export const PanelTitle = ({ children }: { children: ReactNode }) => (
  <p className="text-xs uppercase tracking-[0.18em] text-white/40">{children}</p>
);

export const Loading = ({ label = "Loading…" }: { label?: string }) => (
  <div className="space-y-3" role="status">
    <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
    <div className="h-6 w-48 animate-pulse rounded bg-white/10" />
    <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
    <span className="sr-only">{label}</span>
  </div>
);

export const ErrorState = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div className="rounded-lg border border-amber-400/20 bg-amber-400/[0.04] p-4">
    <p className="text-sm text-amber-200/90">{message}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/80 hover:border-white/30 hover:text-white"
      >
        Try again
      </button>
    )}
  </div>
);

export const EmptyState = ({ message }: { message: string }) => (
  <p className="text-sm text-white/45">{message}</p>
);

export const Button = ({
  children,
  onClick,
  disabled,
  type = "button",
  variant = "primary",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  variant?: "primary" | "ghost" | "danger";
}) => {
  const styles = {
    primary:
      "bg-emerald-400/90 text-black hover:bg-emerald-300 disabled:bg-white/10 disabled:text-white/30",
    ghost:
      "border border-white/15 text-white/80 hover:border-white/30 hover:text-white disabled:opacity-40",
    danger: "border border-red-400/30 text-red-300 hover:bg-red-400/10 disabled:opacity-40",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed ${styles}`}
    >
      {children}
    </button>
  );
};

export const Field = ({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) => (
  <label className="block">
    <span className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-white/40">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs text-white/35">{hint}</span>}
  </label>
);

export const inputClass =
  "w-full rounded-lg border border-white/12 bg-black/30 px-3 py-2 text-sm text-white " +
  "placeholder:text-white/25 focus:border-emerald-400/50 focus:outline-none";

export const Badge = ({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "good" | "warn" | "bad";
  children: ReactNode;
}) => {
  const styles = {
    neutral: "border-white/15 text-white/60",
    good: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    warn: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    bad: "border-red-400/30 bg-red-400/10 text-red-300",
  }[tone];
  return (
    <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.12em] ${styles}`}>
      {children}
    </span>
  );
};
