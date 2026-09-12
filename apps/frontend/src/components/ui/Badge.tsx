import type { ReactNode } from "react";

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-[var(--r)] border border-line bg-surface-raised px-2 py-0.5 font-mono text-[11px] font-medium text-ink-2">
      {children}
    </span>
  );
}
