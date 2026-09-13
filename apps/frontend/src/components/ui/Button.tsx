import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  isLoading?: boolean;
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-accent bg-accent text-accent-fg hover:bg-[var(--accent-hover)]",
  secondary: "border-line bg-surface text-ink hover:border-line-strong",
  danger: "border-danger bg-danger text-danger-fg hover:bg-[#7f1d1d]",
  ghost: "border-transparent bg-transparent text-ink-2 hover:bg-surface-raised",
};

export function Button({
  children,
  className = "",
  disabled,
  isLoading = false,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps){
  return (
    <button
      className={`inline-flex h-10 items-center justify-center rounded-[var(--r)] border px-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      type={type}
      {...props}
    >
      {isLoading ? "Working..." : children}
    </button>
  );
}
