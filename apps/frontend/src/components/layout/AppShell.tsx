import type { ReactNode } from "react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import {
  getCurrentUser,
  getStoredUser,
  logout,
  updateCurrentUser,
} from "../../lib/api/auth";
import { getBoards } from "../../lib/api/board";
import { getOrganizations } from "../../lib/api/organization";
import { initials } from "../../lib/format";
import type { ApiOrganization, Board, User } from "../../types/taskforge";

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { organizationId } = useParams();
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    getStoredUser(),
  );
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const userId = currentUser?.id;
  const [organizations, setOrganizations] = useState<ApiOrganization[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Board[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!userId || !organizationId) return;

    getOrganizations()
      .then(setOrganizations)
      .catch(() => setOrganizations([]));
  }, [userId, organizationId]);

  const currentOrganization = organizations.find(
    (organization) => organization.id === organizationId,
  );

  useEffect(() => {
    if (!userId) return;
    getCurrentUser()
      .then(setCurrentUser)
      .catch(() => undefined);
  }, [userId]);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      if (!currentOrganization) {
        setSearchResults([]);
        return;
      }
      const boards = await getBoards(currentOrganization.id);
      setSearchResults(
        boards.filter((board) => board.title.toLowerCase().includes(query)),
      );
    } finally {
      setIsSearching(false);
    }
  }

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
            {currentOrganization ? (
              <button
                className="hidden min-w-0 items-center gap-1 rounded bg-surface-raised px-2 py-1 text-left text-sm font-medium text-ink hover:bg-[var(--surface-container-high)] sm:flex"
                onClick={() => navigate("/organizations")}
                type="button"
              >
                <span className="truncate">{currentOrganization.name}</span>
                <Icon className="text-[18px] text-ink-3">unfold_more</Icon>
              </button>
            ) : null}
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

          <form
            className="relative hidden max-w-md flex-1 items-center rounded-md bg-surface-raised px-2 py-1.5 text-ink-3 md:flex"
            onSubmit={handleSearch}
          >
            <Icon className="mr-2 text-[18px]">search</Icon>
            <input
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search boards..."
              type="text"
              value={searchQuery}
            />
            <span className="rounded bg-surface px-1.5 py-0.5 font-mono text-[10px] text-ink-3">
              Enter
            </span>
            {searchQuery.trim() ? (
              <div className="absolute left-0 right-0 top-11 z-50 rounded-md border border-line bg-surface p-2 shadow-lg">
                {isSearching ? (
                  <p className="p-2 text-xs text-ink-3">Searching...</p>
                ) : searchResults.length ? (
                  searchResults.map((result) => (
                    <Link
                      className="block rounded px-2 py-2 text-sm text-ink hover:bg-surface-raised"
                      key={result.id}
                      onClick={() => setSearchQuery("")}
                      to={`/organizations/${result.organizationId}/boards/${result.id}`}
                    >
                      {result.title}
                    </Link>
                  ))
                ) : (
                  <p className="p-2 text-xs text-ink-3">No boards found.</p>
                )}
              </div>
            ) : null}
          </form>

          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 rounded-md p-1 text-left hover:bg-surface-raised"
              onClick={() => setIsProfileOpen(true)}
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
      <ProfileDialog
        key={`${currentUser?.id ?? "user"}-${isProfileOpen}`}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
        onSaved={(user) => setCurrentUser(user)}
      />
      <footer className="bg-surface py-4 shadow-[0_-1px_6px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col items-center justify-between gap-2 px-4 text-sm text-ink-3 sm:flex-row lg:px-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-accent">TaskForge</span>
            <span>© 2026 TaskForge Systems. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span>Project workspace</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProfileDialog({
  isOpen,
  onClose,
  onSaved,
  user,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (user: User) => void;
  user: User | null;
}) {
  const [name, setName] = useState(user?.name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [error, setError] = useState("");

  if (!isOpen || !user) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm">
      <section className="w-full max-w-md rounded-xl bg-surface p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3">
              Profile
            </p>
            <h2 className="mt-1 text-xl font-semibold text-ink">
              Your account
            </h2>
          </div>
          <button
            aria-label="Close profile"
            className="rounded-md p-1 text-ink-3 hover:bg-surface-raised"
            onClick={onClose}
            type="button"
          >
            <Icon>close</Icon>
          </button>
        </div>
        <form
          className="mt-6 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              const updated = await updateCurrentUser({
                name,
                avatarUrl: avatarUrl || null,
              });
              onSaved(updated);
              onClose();
            } catch {
              setError("Unable to save profile changes.");
            }
          }}
        >
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">
              Name
            </span>
            <input
              className="h-10 w-full rounded-md bg-surface-raised px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-accent/20"
              onChange={(event) => setName(event.target.value)}
              required
              value={name}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">
              Avatar URL
            </span>
            <input
              className="h-10 w-full rounded-md bg-surface-raised px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-accent/20"
              onChange={(event) => setAvatarUrl(event.target.value)}
              placeholder="https://..."
              type="url"
              value={avatarUrl}
            />
          </label>
          <p className="text-xs text-ink-3">{user.email}</p>
          {error ? (
            <p className="rounded-md bg-[var(--destructive-wash)] p-2 text-sm text-danger">
              {error}
            </p>
          ) : null}
          <div className="flex justify-end gap-2 pt-2">
            <button
              className="h-9 rounded-md bg-surface-raised px-4 text-sm font-medium text-ink"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="h-9 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg"
              type="submit"
            >
              Save changes
            </button>
          </div>
        </form>
      </section>
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
