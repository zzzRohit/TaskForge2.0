import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  boards as initialBoards,
  organizations,
} from "../../data/mock/taskforge";
import { canPerformBoardAction } from "../../lib/permissions";
import type { MockBoard } from "../../types/taskforge";
import { AppShell, PageContainer } from "../layout/AppShell";
import { Breadcrumb } from "../layout/Breadcrumb";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Input, Textarea } from "../ui/Field";
import { Modal } from "../ui/Modal";
import { EmptyState, ErrorState, SkeletonGrid } from "../ui/States";

export function BoardsPage() {
  const { organizationId = "" } = useParams();
  const organization = organizations.find((item) => item.id === organizationId);
  const [boards, setBoards] = useState<MockBoard[]>(initialBoards);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const organizationBoards = useMemo(
    () => boards.filter((board) => board.organizationId === organizationId),
    [boards, organizationId],
  );

  if (!organization) {
    return (
      <AppShell>
        <PageContainer>
          <ErrorState message="Something went wrong." />
        </PageContainer>
      </AppShell>
    );
  }

  const canCreate = canPerformBoardAction(organization.role, "create");

  return (
    <AppShell>
      <PageContainer>
        <Breadcrumb
          items={[
            { label: "Organizations", to: "/organizations" },
            { label: organization.name },
          ]}
        />
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold text-ink">
                {organization.name}
              </h1>
              <Badge>{organization.role}</Badge>
            </div>
            <p className="mt-2 text-sm text-ink-2">Boards</p>
          </div>
          {canCreate ? (
            <Button onClick={() => setIsCreateOpen(true)}>+ New Board</Button>
          ) : null}
        </div>

        {isLoading ? <SkeletonGrid /> : null}
        {hasError ? (
          <ErrorState
            message="Something went wrong."
            onRetry={() => setHasError(false)}
          />
        ) : null}
        {!isLoading && !hasError && organizationBoards.length === 0 ? (
          <EmptyState
            action={canCreate ? () => setIsCreateOpen(true) : undefined}
            message="Create a board to start organizing your work."
            title="No boards yet."
          />
        ) : null}
        {!isLoading && !hasError && organizationBoards.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {organizationBoards.map((board) => (
              <BoardCard
                board={board}
                key={board.id}
                organizationId={organization.id}
              />
            ))}
          </div>
        ) : null}
      </PageContainer>
      <BoardFormDialog
        actionLabel="Create Board"
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={(input) => {
          setBoards((current) => [
            ...current,
            {
              id: input.title.toLowerCase().replaceAll(" ", "-"),
              title: input.title,
              description: input.description || null,
              organizationId: organization.id,
              ownerId: "user-1",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              updatedLabel: "Updated just now",
            },
          ]);
        }}
        title="Create Board"
      />
    </AppShell>
  );
}

export function BoardDetailPage() {
  const navigate = useNavigate();
  const { boardId = "", organizationId = "" } = useParams();
  const organization = organizations.find((item) => item.id === organizationId);
  const [boards, setBoards] = useState<MockBoard[]>(initialBoards);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const board = boards.find(
    (item) => item.id === boardId && item.organizationId === organizationId,
  );

  if (!organization || !board) {
    return (
      <AppShell>
        <PageContainer>
          <div className="rounded-[var(--r-lg)] border border-line bg-surface px-6 py-8">
            <h1 className="text-xl font-semibold text-ink">Board not found.</h1>
            <Button
              className="mt-5"
              onClick={() => navigate(`/organizations/${organizationId}/boards`)}
              variant="secondary"
            >
              Return to boards
            </Button>
          </div>
        </PageContainer>
      </AppShell>
    );
  }

  const canManage = canPerformBoardAction(organization.role, "edit");

  return (
    <AppShell>
      <PageContainer>
        <Breadcrumb
          items={[
            { label: "Organizations", to: "/organizations" },
            {
              label: organization.name,
              to: `/organizations/${organization.id}/boards`,
            },
            { label: board.title },
          ]}
        />
        <section className="rounded-[var(--r-lg)] border border-line bg-surface px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold text-ink">{board.title}</h1>
              <p className="mt-3 text-sm leading-6 text-ink-2">
                {board.description ?? "No description provided."}
              </p>
            </div>
            {canManage ? (
              <div className="flex gap-2">
                <Button onClick={() => setIsEditOpen(true)} variant="secondary">
                  Edit
                </Button>
                <Button onClick={() => setIsDeleteOpen(true)} variant="danger">
                  Delete
                </Button>
              </div>
            ) : null}
          </div>
        </section>

        <section className="mt-5 rounded-[var(--r-lg)] border border-dashed border-line-strong bg-surface-raised px-6 py-12 text-center">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-ink-3">
            Next milestone
          </p>
          <h2 className="mt-3 text-xl font-semibold text-ink">Lists & Cards</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-2">
            Your workspace is ready. Lists and cards will appear here.
          </p>
          <p className="mt-5 font-mono text-xs text-ink-3">
            Lists &gt; Cards &gt; Drag &amp; Drop
          </p>
        </section>
      </PageContainer>

      <BoardFormDialog
        actionLabel="Save Changes"
        initialDescription={board.description ?? ""}
        initialTitle={board.title}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={(input) => {
          setBoards((current) =>
            current.map((item) =>
              item.id === board.id
                ? {
                    ...item,
                    title: input.title,
                    description: input.description || null,
                    updatedAt: new Date().toISOString(),
                    updatedLabel: "Updated just now",
                  }
                : item,
            ),
          );
        }}
        title="Edit Board"
      />
      <DeleteBoardDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onDelete={() => {
          setBoards((current) => current.filter((item) => item.id !== board.id));
          navigate(`/organizations/${organization.id}/boards`);
        }}
      />
    </AppShell>
  );
}

function BoardCard({
  board,
  organizationId,
}: {
  board: MockBoard;
  organizationId: string;
}) {
  return (
    <Link
      className="group flex min-h-36 flex-col justify-between rounded-[var(--r-lg)] border border-line bg-surface p-4 hover:border-line-strong hover:bg-surface-raised"
      to={`/organizations/${organizationId}/boards/${board.id}`}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-semibold text-ink">{board.title}</h2>
          <span className="text-ink-3 group-hover:text-ink">→</span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink-2">
          {board.description}
        </p>
      </div>
      <p className="mt-6 font-mono text-xs text-ink-3">{board.updatedLabel}</p>
    </Link>
  );
}

function BoardFormDialog({
  actionLabel,
  initialDescription = "",
  initialTitle = "",
  isOpen,
  onClose,
  onSubmit,
  title,
}: {
  actionLabel: string;
  initialDescription?: string;
  initialTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: { description: string; title: string }) => void;
  title: string;
}) {
  const [boardTitle, setBoardTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (boardTitle.trim().length === 0) {
      setError("Title is required.");
      return;
    }

    setError("");
    setIsLoading(true);
    window.setTimeout(() => {
      onSubmit({
        description: description.trim(),
        title: boardTitle.trim(),
      });
      setIsLoading(false);
      setSuccess("Saved.");
      window.setTimeout(() => {
        setSuccess("");
        onClose();
      }, 400);
    }, 600);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <Input
          error={error}
          label="Title"
          onChange={(event) => setBoardTitle(event.target.value)}
          placeholder="Product Roadmap"
          value={boardTitle}
        />
        <Textarea
          label="Description"
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Plan upcoming product work."
          value={description}
        />
        {success ? <p className="text-sm text-success">{success}</p> : null}
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button isLoading={isLoading} type="submit">
            {actionLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteBoardDialog({
  isOpen,
  onClose,
  onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  function handleDelete() {
    setIsLoading(true);
    window.setTimeout(() => {
      setIsLoading(false);
      onDelete();
    }, 500);
  }

  return (
    <Modal
      description="This action cannot be undone."
      isOpen={isOpen}
      onClose={onClose}
      title="Delete board?"
    >
      <div className="flex justify-end gap-2">
        <Button onClick={onClose} variant="secondary">
          Cancel
        </Button>
        <Button isLoading={isLoading} onClick={handleDelete} variant="danger">
          Delete Board
        </Button>
      </div>
    </Modal>
  );
}
