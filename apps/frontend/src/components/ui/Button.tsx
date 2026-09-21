import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  isLoading?: boolean;
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-accent bg-accent text-accent-fg shadow-[var(--shadow-sm)] hover:bg-[var(--accent-hover)] active:translate-y-px",
  secondary:
    "border-line bg-surface text-ink shadow-[var(--shadow-sm)] hover:border-line-strong hover:bg-surface-raised active:translate-y-px",
  danger:
    "border-danger bg-danger text-danger-fg shadow-[var(--shadow-sm)] hover:bg-[#912018] active:translate-y-px",
  ghost:
    "border-transparent bg-transparent text-ink-2 hover:bg-surface-raised hover:text-ink",
};

export function Button({
  children,
  className = "",
  disabled,
  isLoading = false,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--r)] border px-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      type={type}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Working
        </>
      ) : (
        children
      )}
    </button>
  );
}
