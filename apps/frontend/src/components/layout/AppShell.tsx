import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { currentUser } from "../../data/mock/taskforge";
import { initials } from "../../lib/format";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full bg-bg">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link className="text-base font-semibold tracking-normal text-ink" to="/organizations">
            TaskForge
          </Link>
          <button className="flex items-center gap-2 rounded-[var(--r)] px-2 py-1.5 text-left hover:bg-surface-raised">
            <span className="grid h-7 w-7 place-items-center rounded-[var(--r)] bg-accent text-xs font-semibold text-accent-fg">
              {initials(currentUser.name)}
            </span>
            <span className="hidden text-sm font-medium text-ink sm:inline">
              {currentUser.name}
            </span>
            <span className="text-ink-3">v</span>
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}

export function PageContainer({ children }: { children: ReactNode }) {
  return <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>;
}
