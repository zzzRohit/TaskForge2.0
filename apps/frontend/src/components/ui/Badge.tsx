import type { ReactNode } from "react";

type BadgeTone = "default" | "success" | "warning" | "muted";

const tones: Record<BadgeTone, string> = {
  default: "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]",
  muted: "border-line bg-surface-raised text-ink-2",
  success: "border-[#bbf7d0] bg-[#f0fdf4] text-success",
  warning: "border-[#fed7aa] bg-[#fff7ed] text-warning",
};

export function Badge({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-[var(--r)] border px-2 py-0.5 text-[11px] font-medium uppercase tracking-normal ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
