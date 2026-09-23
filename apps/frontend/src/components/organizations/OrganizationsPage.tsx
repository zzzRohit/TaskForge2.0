import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import {
  createOrganization,
  getOrganizations,
} from "../../lib/api/organization";
import { initials } from "../../lib/format";
import type { ApiOrganization, Role } from "../../types/taskforge";
import { AppShell, Icon, PageContainer } from "../layout/AppShell";

type ViewState = "populated" | "modal" | "loading" | "empty" | "error";

export function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<ApiOrganization[]>([]);
  const [viewState, setViewState] = useState<ViewState>("loading");

  useEffect(() => {
    getOrganizations()
      .then((data) => {
        setOrganizations(data);
        setViewState(data.length ? "populated" : "empty");
      })
      .catch(() => {
        setViewState("error");
      });
  }, []);
  const [query, setQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const visibleOrganizations = useMemo(
    () =>
      organizations.filter((organization) =>
        organization.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [organizations, query],
  );

  function openCreate() {
    setViewState("modal");
    setIsCreateOpen(true);
  }

  return (
    <AppShell>
      <StateBar
        active={viewState}
        onCreate={openCreate}
        onSelect={(state) => setViewState(state)}
      />
      <PageContainer>
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
          <OrganizationEmpty onCreate={openCreate} />
        ) : null}
        {viewState === "error" ? (
          <OrganizationError onRetry={() => setViewState("populated")} />
        ) : null}
        {viewState === "populated" || viewState === "modal" ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleOrganizations.map((organization) => (
              <OrganizationCard
                key={organization.id}
                organization={organization}
              />
            ))}
          </div>
        ) : null}
      </PageContainer>
      <CreateOrganizationDialog
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setViewState("populated");
        }}
        onCreate={async (name) => {
          const organization = await createOrganization(name);
          setOrganizations((current) => [...current, organization]);
        }}
      />
    </AppShell>
  );
}

function StateBar({
  active,
  onCreate,
  onSelect,
}: {
  active: ViewState;
  onCreate: () => void;
  onSelect: (state: ViewState) => void;
}) {
  const states: Array<{ label: string; value: ViewState }> = [
    { label: "Populated list", value: "populated" },
    { label: "Create Modal", value: "modal" },
    { label: "Skeleton", value: "loading" },
    { label: "Empty", value: "empty" },
    { label: "Error", value: "error" },
  ];

  return (
    <aside className="flex w-full flex-col justify-between gap-3 bg-[var(--surface-container-low)] px-4 py-2.5 shadow-sm lg:flex-row lg:items-center lg:px-6">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.04em] text-ink-2 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Workspace Route /organizations
        </span>
      </div>
      <div className="flex w-full gap-1 overflow-x-auto rounded-lg bg-surface p-1 shadow-sm lg:w-auto">
        {states.map((state) => (
          <button
            className={`shrink-0 rounded px-2.5 py-1 text-[13px] font-medium ${
              active === state.value
                ? "bg-accent text-accent-fg"
                : "text-ink-2 hover:bg-surface-raised hover:text-ink"
            }`}
            key={state.value}
            onClick={() =>
              state.value === "modal" ? onCreate() : onSelect(state.value)
            }
            type="button"
          >
            {state.label}
          </button>
        ))}
      </div>
    </aside>
  );
}

function OrganizationCard({ organization }: { organization: ApiOrganization }) {
  return (
    <Link
      className="group flex min-h-[210px] flex-col justify-between rounded-xl bg-surface p-6 shadow-sm hover:shadow-md"
      to={`/organizations/${organization.id}/boards`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[var(--surface-container-high)] text-base font-semibold text-accent shadow-inner group-hover:bg-accent group-hover:text-accent-fg">
              {initials(organization.name)}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-ink">
                {organization.name}
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-ink-3">
                {organization.id}
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
        <Icon className="text-ink-2 group-hover:translate-x-1 group-hover:text-accent">
          arrow_forward
        </Icon>
      </div>
    </Link>
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

function OrganizationEmpty({ onCreate }: { onCreate: () => void }) {
  return (
    <section className="flex flex-col items-center justify-center px-4 py-20 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[var(--surface-container-high)] text-ink-2 shadow-inner">
        <Icon className="text-[32px]">folder_off</Icon>
      </span>
      <h2 className="mt-4 text-xl font-semibold text-ink">
        No organizations found
      </h2>
      <p className="mt-2 max-w-md text-[15px] text-ink-2">
        You are not a member of any workspace yet. Create your first workspace
        to organize engineering boards, track issues, and invite team members.
      </p>
      <button
        className="mt-6 flex h-9 items-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg"
        onClick={onCreate}
        type="button"
      >
        <Icon className="text-[18px]">add</Icon>Create your first workspace
      </button>
    </section>
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
  const [name, setName] = useState("Acme Design Lab");
  const slug =
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "workspace";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCreate(name.trim());
    onClose();
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
              type="submit"
            >
              Create Organization
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
