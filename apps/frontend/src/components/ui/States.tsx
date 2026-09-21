import { Button } from "./Button";

export function SkeletonGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((item) => (
        <div
          className="h-40 animate-pulse rounded-[var(--r-lg)] border border-line bg-surface"
          key={item}
        >
          <div className="m-4 h-10 w-10 rounded-[var(--r)] bg-surface-raised" />
          <div className="mx-4 mt-5 h-3 w-1/2 rounded bg-surface-raised" />
          <div className="mx-4 mt-3 h-3 w-2/3 rounded bg-surface-raised" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  action,
  message,
  title,
}: {
  action?: () => void;
  message: string;
  title: string;
}) {
  return (
    <div className="rounded-[var(--r-lg)] border border-dashed border-line-strong bg-surface px-6 py-10 text-center shadow-[var(--shadow-sm)]">
      <div className="mx-auto mb-4 grid h-10 w-10 place-items-center rounded-[var(--r-lg)] border border-line bg-surface-raised text-accent">
        +
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink-2">{message}</p>
      {action ? (
        <Button className="mt-5" onClick={action}>
          Create
        </Button>
      ) : null}
    </div>
  );
}

export function ErrorState({
  message = "Something went wrong.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-[var(--r-lg)] border border-line bg-surface px-6 py-8 shadow-[var(--shadow-sm)]">
      <h3 className="text-base font-semibold text-ink">{message}</h3>
      <p className="mt-2 text-sm text-ink-2">
        We could not load this view. Please try again.
      </p>
      {onRetry ? (
        <Button className="mt-5" onClick={onRetry} variant="secondary">
          Try again
        </Button>
      ) : null}
    </div>
  );
}
