import { Button } from "./Button";

export function SkeletonGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((item) => (
        <div
          className="h-32 animate-pulse rounded-[var(--r-lg)] border border-line bg-surface"
          key={item}
        />
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
    <div className="rounded-[var(--r-lg)] border border-dashed border-line-strong bg-surface px-6 py-10 text-center">
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
    <div className="rounded-[var(--r-lg)] border border-line bg-surface px-6 py-8">
      <h3 className="text-base font-semibold text-ink">{message}</h3>
      <p className="mt-2 text-sm text-ink-2">
        The UI is showing the error pattern that will be wired to the backend
        later.
      </p>
      {onRetry ? (
        <Button className="mt-5" onClick={onRetry} variant="secondary">
          Try again
        </Button>
      ) : null}
    </div>
  );
}
