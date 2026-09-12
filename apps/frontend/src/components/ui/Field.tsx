import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

type FieldShellProps = {
  children: ReactNode;
  error?: string;
  label: string;
};

function FieldShell({ children, error, label }: FieldShellProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink">{label}</span>
      {children}
      {error ? <span className="mt-2 block text-xs text-danger">{error}</span> : null}
    </label>
  );
}

export function Input({
  error,
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { error?: string; label: string }) {
  return (
    <FieldShell error={error} label={label}>
      <input
        className={`h-10 w-full rounded-[var(--r)] border bg-surface px-3 text-sm text-ink outline-none placeholder:text-ink-3 focus:border-accent ${
          error ? "border-danger" : "border-line"
        }`}
        {...props}
      />
    </FieldShell>
  );
}

export function Textarea({
  error,
  label,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string;
  label: string;
}) {
  return (
    <FieldShell error={error} label={label}>
      <textarea
        className={`min-h-24 w-full resize-none rounded-[var(--r)] border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-3 focus:border-accent ${
          error ? "border-danger" : "border-line"
        }`}
        {...props}
      />
    </FieldShell>
  );
}
