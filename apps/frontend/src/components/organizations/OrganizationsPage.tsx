import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import {
  createOrganization,
  addOrganizationMember,
  getOrganizations,
  getOrganizationMembers,
  removeOrganizationMember,
  updateOrganizationMemberRole,
  type OrganizationMember,
} from "../../lib/api/organization";
import { initials } from "../../lib/format";
import type { ApiOrganization, Role } from "../../types/taskforge";
import { AppShell, Icon, PageContainer } from "../layout/AppShell";
import { Breadcrumb } from "../layout/Breadcrumb";

type ViewState = "populated" | "loading" | "empty" | "error";

export function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<ApiOrganization[]>([]);
  const [viewState, setViewState] = useState<ViewState>("loading");

  async function loadOrganizations() {
    setViewState("loading");
    try {
      const data = await getOrganizations();
      setOrganizations(data);
      setViewState(data.length ? "populated" : "empty");
    } catch {
      setViewState("error");
    }
  }

  useEffect(() => {
    getOrganizations()
      .then((data) => {
        setOrganizations(data);
        setViewState(data.length ? "populated" : "empty");
      })
      .catch(() => setViewState("error"));
  }, []);
  const [query, setQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [membersOrganization, setMembersOrganization] =
    useState<ApiOrganization | null>(null);

  const visibleOrganizations = useMemo(
    () =>
      organizations.filter((organization) =>
        organization.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [organizations, query],
  );

  function openCreate() {
    setIsCreateOpen(true);
  }

  return (
    <AppShell>
      <PageContainer>
        <Breadcrumb items={[{ label: "Organizations" }]} />
        <section className="flex flex-col justify-between gap-6 pb-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-2">
              <span>Directory</span>
              <span className="text-ink-3">/</span>
              <span className="text-ink">Workspaces</span>
            </div>
            <h1 className="mt-2 text-[28px] font-semibold leading-[34px] tracking-normal text-ink">
              Organizations
            </h1>
            <p className="mt-2 text-[15px] leading-[22px] text-ink-2">
              Workspaces and organizations you manage or collaborate in across
              your engineering clusters.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Icon className="absolute left-3 top-2.5 text-[18px] text-ink-3">
                filter_list
              </Icon>
              <input
                className="h-9 rounded-md bg-surface pl-9 pr-3 text-[13px] text-ink shadow-sm outline-none placeholder:text-ink-3"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter workspaces..."
                value={query}
              />
            </div>
            <button
              className="flex h-9 items-center gap-2 rounded-md bg-accent px-4 text-[13px] font-medium text-accent-fg shadow-sm hover:bg-[var(--accent-hover)]"
              onClick={openCreate}
              type="button"
            >
              <Icon className="text-[18px]">add</Icon>
              Create Organization
            </button>
          </div>
        </section>

        {viewState === "loading" ? <OrganizationSkeleton /> : null}
        {viewState === "empty" ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <CreateOrganizationCard onCreate={openCreate} />
          </div>
        ) : null}
        {viewState === "error" ? (
          <OrganizationError onRetry={() => void loadOrganizations()} />
        ) : null}
        {viewState === "populated" ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visibleOrganizations.map((organization) => (
              <OrganizationCard
                key={organization.id}
                organization={organization}
                onManageMembers={() => setMembersOrganization(organization)}
              />
            ))}
            <CreateOrganizationCard onCreate={openCreate} />
          </div>
        ) : null}
      </PageContainer>
      <CreateOrganizationDialog
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
        }}
        onCreate={async (name) => {
          const organization = await createOrganization(name);
          setOrganizations((current) => [...current, organization]);
        }}
      />
      <OrganizationMembersDialog
        isOpen={Boolean(membersOrganization)}
        onClose={() => setMembersOrganization(null)}
        organization={membersOrganization}
      />
    </AppShell>
  );
}

function OrganizationCard({
  onManageMembers,
  organization,
}: {
  onManageMembers: () => void;
  organization: ApiOrganization;
}) {
  const navigate = useNavigate();
  const destination = `/organizations/${organization.id}/boards`;

  return (
    <article
      aria-label={`Open ${organization.name}`}
      className="group flex min-h-[190px] cursor-pointer flex-col justify-between rounded-lg border border-line bg-surface p-5 shadow-[var(--shadow-sm)] hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[var(--shadow-md)]"
      onClick={() => navigate(destination)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate(destination);
        }
      }}
      role="link"
      tabIndex={0}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[var(--surface-container-high)] text-base font-semibold text-accent shadow-inner group-hover:bg-accent group-hover:text-accent-fg">
              {initials(organization.name)}
            </span>
            <div className="min-w-0">
              <span className="truncate text-base font-semibold text-ink group-hover:text-accent">
                {organization.name}
              </span>
            </div>
          </div>
          <RolePill role={organization.role} />
        </div>
        <div className="flex items-center justify-between gap-4 text-[13px] text-ink-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Icon className="text-[16px] text-ink-3">group</Icon>
              <strong className="font-medium text-ink">
                {organization.members}
              </strong>
              Members
            </span>
            <span className="flex items-center gap-1.5">
              <Icon className="text-[16px] text-ink-3">dashboard</Icon>
              <strong className="font-medium text-ink">
                {organization.boards}
              </strong>
              Boards
            </span>
          </div>
          <AvatarPile
            avatars={organization.memberAvatars}
            extra={organization.members - organization.memberAvatars.length}
          />
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between pt-2 text-ink-2">
        <span className="flex items-center gap-1 text-[13px]">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Updated {new Date(organization.updatedAt).toLocaleDateString()}
        </span>
        <div className="flex items-center gap-2">
          {organization.role === "OWNER" || organization.role === "ADMIN" ? (
            <button
              className="rounded-md px-2 py-1 text-[12px] font-medium text-ink-2 hover:bg-surface-raised hover:text-ink"
              onClick={(event) => {
                event.stopPropagation();
                onManageMembers();
              }}
              type="button"
            >
              Members
            </button>
          ) : null}
          <span
            aria-label={`Open ${organization.name}`}
            className="text-ink-2 group-hover:translate-x-1 group-hover:text-accent"
          >
            <Icon>arrow_forward</Icon>
          </span>
        </div>
      </div>
    </article>
  );
}

function CreateOrganizationCard({ onCreate }: { onCreate: () => void }) {
  return (
    <button
      className="group flex min-h-[190px] flex-col items-center justify-center rounded-lg border border-dashed border-line-strong bg-surface p-5 text-center hover:-translate-y-0.5 hover:border-accent hover:bg-surface-raised"
      onClick={onCreate}
      type="button"
    >
      <span className="grid h-10 w-10 place-items-center rounded-full bg-surface-raised text-accent group-hover:bg-accent group-hover:text-accent-fg">
        <Icon>add</Icon>
      </span>
      <span className="mt-3 text-sm font-semibold text-ink">
        Create Organization
      </span>
      <span className="mt-1 text-xs text-ink-3">Start a new workspace</span>
    </button>
  );
}

function OrganizationMembersDialog({
  isOpen,
  onClose,
  organization,
}: {
  isOpen: boolean;
  onClose: () => void;
  organization: ApiOrganization | null;
}) {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [email, setEmail] = useState("");
  const [memberToRemove, setMemberToRemove] =
    useState<OrganizationMember | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!isOpen || !organization) return;

    getOrganizationMembers(organization.id)
      .then((data) => {
        setMembers(data);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, [isOpen, organization]);

  async function refresh() {
    if (!organization) return;
    const data = await getOrganizationMembers(organization.id);
    setMembers(data);
  }

  async function addMember() {
    if (!organization || !email.trim()) return;
    await addOrganizationMember(organization.id, email.trim());
    setEmail("");
    await refresh();
  }

  async function changeRole(member: OrganizationMember) {
    if (!organization) return;
    const nextRole = member.role === "ADMIN" ? "MEMBER" : "ADMIN";
    await updateOrganizationMemberRole(organization.id, member.id, nextRole);
    await refresh();
  }

  async function removeMember(member: OrganizationMember) {
    if (!organization || member.role === "OWNER") return;
    await removeOrganizationMember(organization.id, member.id);
    await refresh();
    setMemberToRemove(null);
  }

  if (!isOpen || !organization) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm">
      <section className="w-full max-w-lg rounded-xl bg-surface p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
              Organization members
            </p>
            <h2 className="mt-1 text-xl font-semibold text-ink">
              {organization.name}
            </h2>
          </div>
          <button
            aria-label="Close members"
            className="rounded-md p-1 text-ink-3 hover:bg-surface-raised hover:text-ink"
            onClick={onClose}
            type="button"
          >
            <Icon>close</Icon>
          </button>
        </div>

        {state === "loading" ? (
          <div className="mt-6 space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                className="h-12 animate-pulse rounded-lg bg-surface-raised"
                key={item}
              />
            ))}
          </div>
        ) : null}
        {state === "error" ? (
          <p className="mt-6 rounded-lg bg-[var(--destructive-wash)] p-3 text-sm text-danger">
            Unable to load organization members.
          </p>
        ) : null}
        {state === "ready" ? (
          <div className="mt-6 space-y-2">
            {members.map((member) => (
              <div
                className="flex items-center gap-3 rounded-lg border border-line p-3"
                key={member.id}
              >
                {member.avatarUrl ? (
                  <img
                    alt=""
                    className="h-9 w-9 rounded-full object-cover"
                    src={member.avatarUrl}
                  />
                ) : (
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-fg">
                    {initials(member.name)}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">
                    {member.name}
                  </p>
                  <p className="truncate text-xs text-ink-3">{member.email}</p>
                </div>
                <RolePill role={member.role} />
                {organization.role === "OWNER" && member.role !== "OWNER" ? (
                  <button
                    className="rounded-md p-1.5 text-ink-3 hover:bg-surface-raised hover:text-ink"
                    onClick={() => void changeRole(member)}
                    title={
                      member.role === "ADMIN"
                        ? "Demote to member"
                        : "Promote to admin"
                    }
                    type="button"
                  >
                    <Icon className="text-[17px]">swap_vert</Icon>
                  </button>
                ) : null}
                {member.role === "MEMBER" || organization.role === "OWNER" ? (
                  <button
                    className="rounded-md p-1.5 text-ink-3 hover:bg-[var(--destructive-wash)] hover:text-danger"
                    onClick={() => setMemberToRemove(member)}
                    title="Remove member"
                    type="button"
                  >
                    <Icon className="text-[17px]">person_remove</Icon>
                  </button>
                ) : null}
              </div>
            ))}
            {organization.role === "OWNER" || organization.role === "ADMIN" ? (
              <form
                className="mt-5 flex gap-2 border-t border-line pt-5"
                onSubmit={async (event) => {
                  event.preventDefault();
                  try {
                    await addMember();
                  } catch {
                    setState("error");
                  }
                }}
              >
                <input
                  className="h-9 min-w-0 flex-1 rounded-md bg-surface-raised px-3 text-sm text-ink outline-none"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Add member by email"
                  type="email"
                  value={email}
                />
                <button
                  className="h-9 rounded-md bg-accent px-3 text-sm font-medium text-accent-fg disabled:opacity-50"
                  disabled={!email.trim()}
                  type="submit"
                >
                  Add
                </button>
              </form>
            ) : null}
          </div>
        ) : null}
      </section>
      <ConfirmDialog
        isOpen={Boolean(memberToRemove)}
        message={
          memberToRemove
            ? `Remove ${memberToRemove.name} from ${organization.name}?`
            : ""
        }
        onClose={() => setMemberToRemove(null)}
        onConfirm={() =>
          memberToRemove ? removeMember(memberToRemove) : undefined
        }
      />
    </div>
  );
}

function ConfirmDialog({
  isOpen,
  message,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm">
      <section className="w-full max-w-sm rounded-lg border border-line bg-surface p-5 shadow-[var(--shadow-md)]">
        <h2 className="text-base font-semibold text-ink">Confirm removal</h2>
        <p className="mt-2 text-sm text-ink-2">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            className="h-9 rounded-md bg-surface-raised px-3 text-sm font-medium text-ink"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="h-9 rounded-md bg-danger px-3 text-sm font-medium text-danger-fg"
            onClick={() => void onConfirm()}
            type="button"
          >
            Remove
          </button>
        </div>
      </section>
    </div>
  );
}

function AvatarPile({
  avatars,
  extra,
}: {
  avatars: ApiOrganization["memberAvatars"];
  extra: number;
}) {
  if (avatars.length === 0 && extra === 0) return null;

  return (
    <div className="hidden -space-x-1.5 overflow-hidden sm:flex">
      {avatars.map((member) =>
        member.avatarUrl ? (
          <img
            alt={member.name}
            className="h-6 w-6 rounded-full object-cover ring-2 ring-surface"
            key={member.id}
            src={member.avatarUrl}
          />
        ) : (
          <span
            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--surface-container-high)] font-mono text-[9px] font-semibold text-accent ring-2 ring-surface"
            key={member.id}
            title={member.name}
          >
            {initials(member.name)}
          </span>
        ),
      )}
      {extra > 0 ? (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--surface-container-highest)] font-mono text-[10px] text-ink ring-2 ring-surface">
          +{extra}
        </span>
      ) : null}
    </div>
  );
}

function RolePill({ role }: { role: Role }) {
  const className =
    role === "OWNER"
      ? "bg-[var(--role-owner-bg)] text-[var(--role-owner-fg)]"
      : role === "ADMIN"
        ? "bg-[var(--role-admin-bg)] text-[var(--role-admin-fg)]"
        : "bg-surface-raised text-ink-2";

  return (
    <span
      className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] shadow-sm ${className}`}
    >
      {role.toLowerCase()}
    </span>
  );
}

function OrganizationSkeleton() {
  return (
    <div className="grid animate-pulse grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div
          className="h-[230px] rounded-xl bg-surface p-6 shadow-sm"
          key={item}
        >
          <div className="flex justify-between">
            <div className="flex gap-3">
              <div className="h-11 w-11 rounded-lg bg-[var(--surface-container-highest)]" />
              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-[var(--surface-container-highest)]" />
                <div className="h-3 w-20 rounded bg-[var(--surface-container-high)]" />
              </div>
            </div>
            <div className="h-5 w-14 rounded-full bg-[var(--surface-container-high)]" />
          </div>
          <div className="mt-6 h-3 rounded bg-[var(--surface-container-high)]" />
          <div className="mt-2 h-3 w-3/4 rounded bg-[var(--surface-container-high)]" />
        </div>
      ))}
    </div>
  );
}

function OrganizationError({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="flex flex-col items-center justify-center px-4 py-20 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[var(--destructive-wash)] text-danger shadow-sm">
        <Icon className="text-[32px]">sync_problem</Icon>
      </span>
      <h2 className="mt-4 text-xl font-semibold text-ink">
        Unable to load organizations
      </h2>
      <p className="mt-2 max-w-md text-[15px] text-ink-2">
        An error occurred while establishing connection with the workspace
        registry.
      </p>
      <button
        className="mt-6 flex h-9 items-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg"
        onClick={onRetry}
        type="button"
      >
        <Icon className="text-[18px]">refresh</Icon>Retry request
      </button>
    </section>
  );
}

function CreateOrganizationDialog({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void | Promise<void>;
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const slug =
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "workspace";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError("");
      await onCreate(trimmedName);
      setName("");
      onClose();
    } catch {
      setError(
        "Unable to create organization. Check the backend and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--accent-hover)]/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-surface shadow-xl">
        <div className="flex items-start justify-between px-6 pb-4 pt-6">
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
              Workspace Setup
            </span>
            <h2 className="mt-1 text-xl font-semibold text-ink">
              Create Organization
            </h2>
            <p className="mt-1 text-[13px] text-ink-2">
              Set up a space for your team to build, triage, and ship software.
            </p>
          </div>
          <button
            className="rounded-md p-1 text-ink-2 hover:bg-surface-raised hover:text-ink"
            onClick={onClose}
            type="button"
          >
            <Icon>close</Icon>
          </button>
        </div>
        <form
          className="flex flex-col gap-4 px-6 pb-6 pt-2"
          onSubmit={handleSubmit}
        >
          <label className="flex flex-col gap-1.5">
            <span className="flex justify-between text-[13px] font-medium text-ink">
              Organization Name{" "}
              <span className="font-mono text-[10px] uppercase text-ink-3">
                Required
              </span>
            </span>
            <input
              className="h-9 rounded-md bg-surface px-3 text-[13px] text-ink shadow-sm outline-none focus:ring-2 focus:ring-accent/20"
              onChange={(event) => setName(event.target.value)}
              value={name}
            />
          </label>
          {error ? (
            <p className="rounded-md bg-[var(--destructive-wash)] px-3 py-2 text-[13px] text-danger">
              {error}
            </p>
          ) : null}
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-ink">
              Organization URL
            </span>
            <span className="flex h-9 items-center rounded-md bg-surface-raised px-3 text-[13px] shadow-inner">
              <span className="text-ink-3">taskforge.io/</span>
              <input
                className="w-full bg-transparent pl-1 outline-none"
                readOnly
                value={slug}
              />
            </span>
            <span className="font-mono text-[10px] text-ink-2">
              Can be updated later in organization settings.
            </span>
          </label>
          <div className="flex items-start gap-3 rounded-lg bg-[var(--surface-container-low)] p-3">
            <Icon className="mt-0.5 text-accent">lock</Icon>
            <div>
              <p className="text-[13px] font-medium text-ink">
                Private workspace
              </p>
              <p className="text-[13px] text-ink-2">
                Only invited members will have access to repositories and
                boards.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              className="h-9 rounded-md bg-surface-raised px-4 text-sm font-medium text-ink hover:bg-[var(--surface-container-high)]"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="h-9 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg hover:bg-[var(--accent-hover)]"
              disabled={isSubmitting || !name.trim()}
              type="submit"
            >
              {isSubmitting ? "Creating..." : "Create Organization"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
