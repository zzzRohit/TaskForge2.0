import type { ReactNode } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { organizations } from "../../data/mock/taskforge";
import { getStoredUser, logout } from "../../lib/api/auth";
import { initials } from "../../lib/format";

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { organizationId } = useParams();
  const currentUser = getStoredUser();
  const currentOrganization =
    organizations.find((item) => item.id === organizationId) ??
    organizations[0];

  return (
    <div className="min-h-full bg-bg text-ink">
      <header className="fixed left-0 right-0 top-0 z-40 bg-surface/90 shadow-[0_1px_8px_rgba(0,0,0,0.03)] backdrop-blur-md">
        <div className="flex h-14 items-center justify-between gap-3 px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              className="flex shrink-0 items-center gap-2 text-base font-semibold tracking-tight text-accent"
              to="/organizations"
            >
              <TaskForgeLogo />
              <span className="hidden sm:inline">TaskForge</span>
            </Link>
            <div className="hidden h-4 w-px bg-line sm:block" />
            <button
              className="hidden min-w-0 items-center gap-1 rounded bg-surface-raised px-2 py-1 text-left text-sm font-medium text-ink hover:bg-[var(--surface-container-high)] sm:flex"
              onClick={() => navigate("/organizations")}
              type="button"
            >
              <span className="truncate">
                {currentOrganization?.name ?? "Engineering Team"}
              </span>
              <Icon className="text-[18px] text-ink-3">unfold_more</Icon>
            </button>
            <nav className="flex items-center gap-1">
              <ShellLink to="/organizations">Organizations</ShellLink>
              {currentOrganization ? (
                <ShellLink
                  to={`/organizations/${currentOrganization.id}/boards`}
                >
                  Boards
                </ShellLink>
              ) : null}
            </nav>
          </div>

          <div className="hidden max-w-md flex-1 items-center rounded-md bg-surface-raised px-2 py-1.5 text-ink-3 md:flex">
            <Icon className="mr-2 text-[18px]">search</Icon>
            <input
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
              placeholder="Search tasks, boards, docs..."
              type="text"
            />
            <span className="rounded bg-surface px-1.5 py-0.5 font-mono text-[10px] text-ink-3">
              /K
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-label="Notifications"
              className="grid h-8 w-8 place-items-center rounded-md text-ink-2 hover:bg-surface-raised hover:text-ink"
              type="button"
            >
              <Icon>notifications</Icon>
            </button>
            <button
              className="flex items-center gap-2 rounded-md p-1 text-left hover:bg-surface-raised"
              type="button"
            >
              {currentUser?.avatarUrl ? (
                <img
                  alt=""
                  className="h-8 w-8 rounded-full object-cover"
                  src={currentUser.avatarUrl}
                />
              ) : (
                <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-fg">
                  {initials(currentUser?.name ?? "User")}
                </span>
              )}
              <span className="hidden flex-col leading-none lg:flex">
                <span className="text-sm font-medium text-ink">
                  {currentUser?.name ?? "User"}
                </span>
                <span className="mt-1 font-mono text-[10px] uppercase text-ink-3">
                  {currentUser?.role ?? "Member"}
                </span>
              </span>
            </button>
            <button
              aria-label="Sign out"
              className="grid h-8 w-8 place-items-center rounded-md text-ink-2 hover:bg-[var(--destructive-wash)] hover:text-danger"
              onClick={() => {
                logout();
                navigate("/login");
              }}
              type="button"
            >
              <Icon>logout</Icon>
            </button>
          </div>
        </div>
      </header>
      <main className="min-h-screen pt-14">{children}</main>
      <footer className="bg-surface py-4 shadow-[0_-1px_6px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col items-center justify-between gap-2 px-4 text-sm text-ink-3 sm:flex-row lg:px-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-accent">TaskForge</span>
            <span>© 2026 TaskForge Systems. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a className="hover:text-ink" href="#changelog">
              Changelog
            </a>
            <a className="hover:text-ink" href="#docs">
              Documentation
            </a>
            <a className="hover:text-ink" href="#shortcuts">
              Keyboard Shortcuts
            </a>
            <a className="hover:text-ink" href="#support">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ShellLink({ children, to }: { children: ReactNode; to: string }) {
  return (
    <NavLink
      className={({ isActive }) =>
        `rounded-md px-3 py-1.5 text-sm transition-colors ${
          isActive
            ? "bg-accent font-medium text-accent-fg"
            : "text-ink-2 hover:bg-surface-raised hover:text-ink"
        }`
      }
      to={to}
    >
      {children}
    </NavLink>
  );
}

export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-10">
      {children}
    </div>
  );
}

export function TaskForgeLogo() {
  return (
    <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent-hover)] text-accent-fg shadow-sm">
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M12 2 2 7l10 5 10-5-10-5Z" />
        <path d="m2 17 10 5 10-5" />
        <path d="m2 12 10 5 10-5" />
      </svg>
    </span>
  );
}

export function Icon({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined ${className}`}
    >
      {children}
    </span>
  );
}
