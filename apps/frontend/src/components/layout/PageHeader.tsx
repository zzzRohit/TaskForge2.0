import type { ReactNode } from "react";

export function PageHeader({
  actions,
  eyebrow,
  subtitle,
  title,
}: {
  actions?: ReactNode;
  eyebrow?: string;
  subtitle?: string;
  title: string;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-2 text-xs font-medium uppercase text-ink-3">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="truncate text-3xl font-semibold tracking-normal text-ink lg:text-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-2">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
    </div>
  );
}
