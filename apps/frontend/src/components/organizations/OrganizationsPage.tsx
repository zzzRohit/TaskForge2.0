import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { organizations as initialOrganizations } from "../../data/mock/taskforge";
import { initials } from "../../lib/format";
import type { MockOrganization } from "../../types/taskforge";
import { AppShell, PageContainer } from "../layout/AppShell";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Input } from "../ui/Field";
import { Modal } from "../ui/Modal";
import { EmptyState, ErrorState, SkeletonGrid } from "../ui/States";

export function OrganizationsPage() {
  const [organizations, setOrganizations] =
    useState<MockOrganization[]>(initialOrganizations);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <AppShell>
      <PageContainer>
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-ink">Organizations</h1>
            <p className="mt-2 text-sm text-ink-2">
              Choose a workspace to continue.
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            Create Organization
          </Button>
        </div>

        {isLoading ? <SkeletonGrid /> : null}
        {hasError ? (
          <ErrorState onRetry={() => setHasError(false)} />
        ) : null}
        {!isLoading && !hasError && organizations.length === 0 ? (
          <EmptyState
            action={() => setIsCreateOpen(true)}
            message="Create your first workspace to get started."
            title="No organizations yet."
          />
        ) : null}
        {!isLoading && !hasError && organizations.length > 0 ? (
          <div className="grid gap-3">
            {organizations.map((organization) => (
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
        onClose={() => setIsCreateOpen(false)}
        onCreate={(name) => {
          setOrganizations((current) => [
            ...current,
            {
              id: name.toLowerCase().replaceAll(" ", "-"),
              name,
              role: "OWNER",
              members: 1,
              boards: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ]);
        }}
      />
    </AppShell>
  );
}

function OrganizationCard({
  organization,
}: {
  organization: MockOrganization;
}) {
  return (
    <Link
      className="group flex items-center justify-between gap-4 rounded-[var(--r-lg)] border border-line bg-surface px-4 py-4 hover:border-line-strong hover:bg-surface-raised"
      to={`/organizations/${organization.id}/boards`}
    >
      <div className="flex min-w-0 items-center gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--r-lg)] border border-line bg-surface-raised font-semibold text-accent">
          {initials(organization.name)}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-base font-semibold text-ink">
              {organization.name}
            </h2>
            <Badge>{organization.role}</Badge>
          </div>
          <p className="mt-1 text-sm text-ink-2">
            {organization.members} members · {organization.boards} boards
          </p>
        </div>
      </div>
      <span className="text-lg text-ink-3 group-hover:text-ink">→</span>
    </Link>
  );
}

function CreateOrganizationDialog({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (name.trim().length < 2) {
      setError("Organization name is required.");
      return;
    }

    setError("");
    setIsLoading(true);
    window.setTimeout(() => {
      onCreate(name.trim());
      setName("");
      setIsLoading(false);
      onClose();
    }, 500);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Organization">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <Input
          error={error}
          label="Organization name"
          onChange={(event) => setName(event.target.value)}
          placeholder="Design Studio"
          value={name}
        />
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button isLoading={isLoading} type="submit">
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
}
