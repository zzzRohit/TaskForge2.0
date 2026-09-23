import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  boards as initialBoards,
  lists,
  organizations,
} from "../../data/mock/taskforge";
import { canPerformBoardAction } from "../../lib/permissions";
import type { MockBoard, MockCard, MockList } from "../../types/taskforge";
import { AppShell, Icon, PageContainer } from "../layout/AppShell";

type BoardView = "grid" | "empty" | "loading";

export function BoardsPage() {
  const { organizationId = "" } = useParams();
  const organization = organizations.find((item) => item.id === organizationId);
  const [boards, setBoards] = useState<MockBoard[]>(initialBoards);
  const [view, setView] = useState<BoardView>("grid");
  const [roleOverride, setRoleOverride] = useState<"owner" | "member">("owner");
  const [query, setQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toast, setToast] = useState("");

  const organizationBoards = useMemo(
    () =>
      boards.filter(
        (board) =>
          board.organizationId === organizationId &&
          board.title.toLowerCase().includes(query.toLowerCase()),
      ),
    [boards, organizationId, query],
  );

  if (!organization) {
    return (
      <AppShell>
        <PageContainer>
          <ErrorPanel message="Unable to load workspace." />
        </PageContainer>
      </AppShell>
    );
  }

  const effectiveRole =
    roleOverride === "member" ? "MEMBER" : organization.role;
  const canCreate = canPerformBoardAction(effectiveRole, "create");

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  }

  return (
    <AppShell>
      <BoardsStateBar
        onCreate={() => setIsCreateOpen(true)}
        onSelect={(nextView, nextRole) => {
          setView(nextView);
          setRoleOverride(nextRole);
        }}
        role={roleOverride}
        view={view}
      />
      <PageContainer>
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-ink-2">
          <Link
            className="flex items-center gap-1 hover:text-accent"
            to="/organizations"
          >
            <Icon className="text-[16px]">domain</Icon> Organizations
          </Link>
          <Icon className="text-[14px] text-ink-3">chevron_right</Icon>
          <span className="flex items-center gap-1.5 font-medium text-ink">
            <span className="h-2 w-2 rounded-full bg-[var(--role-owner-fg)]" />
            {organization.name}
          </span>
          <Icon className="text-[14px] text-ink-3">chevron_right</Icon>
          <span className="font-medium text-accent">Boards</span>
        </nav>

        <section className="flex flex-col justify-between gap-6 pb-6 lg:flex-row lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[28px] font-semibold leading-[34px] text-ink">
                Boards
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-container-high)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.04em] text-ink-2">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                {organization.name} • {organization.members} members •{" "}
                {organization.boards} boards
              </span>
              <RolePill role={effectiveRole} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Icon className="absolute left-3 top-2.5 text-[18px] text-ink-3">
                search
              </Icon>
              <input
                className="h-9 w-64 rounded-lg bg-surface pl-9 pr-3 text-[13px] text-ink shadow-sm outline-none"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter boards..."
                value={query}
              />
            </div>
            {canCreate ? (
              <button
                className="flex h-9 items-center gap-1.5 rounded-lg bg-accent px-4 text-[13px] font-medium text-accent-fg shadow-md hover:bg-[var(--accent-hover)]"
                onClick={() => setIsCreateOpen(true)}
                type="button"
              >
                <Icon className="text-[18px]">add</Icon>Create Board
              </button>
            ) : null}
          </div>
        </section>

        {view === "loading" ? <BoardsSkeleton /> : null}
        {view === "empty" ? (
          <BoardsEmpty
            canCreate={canCreate}
            onCreate={() => setIsCreateOpen(true)}
          />
        ) : null}
        {view === "grid" ? (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-2">
                Boards in this organization
              </span>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-md bg-[var(--surface-container)] p-1.5 text-ink shadow-sm"
                  title="Grid layout"
                  type="button"
                >
                  <Icon className="text-[18px]">grid_view</Icon>
                </button>
                <button
                  className="rounded-md p-1.5 text-ink-3 hover:bg-[var(--surface-container)] hover:text-ink"
                  title="Table layout"
                  type="button"
                >
                  <Icon className="text-[18px]">view_list</Icon>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {organizationBoards.map((board) => (
                <BoardCard
                  board={board}
                  key={board.id}
                  organizationId={organization.id}
                />
              ))}
            </div>
          </section>
        ) : null}
      </PageContainer>
      <CreateBoardDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={(input) => {
          const id = input.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
          setBoards((current) => [
            {
              activeMembers: 1,
              collaborators: "New board",
              createdAt: new Date().toISOString(),
              description: input.description || "No description provided.",
              id,
              memberAvatars: [],
              organizationId: organization.id,
              ownerId: "user-1",
              status: "Just Created",
              statusTone: "success",
              title: input.title,
              updatedAt: new Date().toISOString(),
              updatedLabel: "Updated just now",
            },
            ...current,
          ]);
          setView("grid");
          showToast(`Board "${input.title}" created successfully.`);
        }}
      />
      {toast ? <Toast message={toast} /> : null}
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
  const [toast, setToast] = useState("");

  const board = boards.find(
    (item) => item.id === boardId && item.organizationId === organizationId,
  );
  const boardLists = lists.filter((list) => list.boardId === boardId);

  if (!organization || !board) {
    return (
      <AppShell>
        <PageContainer>
          <ErrorPanel message="Board not found." />
        </PageContainer>
      </AppShell>
    );
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  }

  const canManage = canPerformBoardAction(organization.role, "edit");

  return (
    <AppShell>
      <div className="bg-surface px-4 py-3 shadow-sm lg:px-10">
        <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-3">
          <nav className="flex items-center gap-1.5 text-sm text-ink-2">
            <Link
              className="flex items-center gap-1 hover:text-accent"
              to="/organizations"
            >
              <Icon className="text-[16px]">domain</Icon>Organizations
            </Link>
            <Icon className="text-[14px]">chevron_right</Icon>
            <Link
              className="font-medium text-ink hover:text-accent"
              to={`/organizations/${organization.id}/boards`}
            >
              {organization.name}
            </Link>
            <Icon className="text-[14px]">chevron_right</Icon>
            <span>Boards</span>
            <Icon className="text-[14px]">chevron_right</Icon>
            <span className="max-w-xs truncate font-medium text-accent">
              {board.title}
            </span>
          </nav>
          <span className="rounded bg-[var(--surface-container)] px-2.5 py-1 font-mono text-[10px] uppercase text-ink-2">
            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-success" />
            Board ID: <strong className="text-ink">BRD-8092-S24</strong>
          </span>
        </div>
      </div>

      <PageContainer>
        <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill board={board} />
              <RolePill role={organization.role} />
              <span className="text-[13px] text-ink-2">
                {board.updatedLabel}
              </span>
            </div>
            <h1 className="mt-2 text-[32px] font-semibold leading-[38px] tracking-normal text-accent lg:text-5xl lg:leading-[52px]">
              {board.title}
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-[22px] text-ink-2">
              {board.description}
            </p>
          </div>
          {canManage ? (
            <div className="flex shrink-0 items-center gap-2">
              <button
                className="flex h-9 items-center gap-2 rounded-md bg-surface px-4 text-sm font-medium text-ink shadow-sm hover:bg-[var(--surface-container-high)]"
                onClick={() => setIsEditOpen(true)}
                type="button"
              >
                <Icon className="text-[17px] text-ink-2">edit</Icon>Edit Board
              </button>
              <button
                className="flex h-9 items-center gap-1.5 rounded-md bg-surface px-3.5 text-sm font-medium text-ink-2 shadow-sm hover:bg-[var(--destructive-wash)] hover:text-danger"
                onClick={() => setIsDeleteOpen(true)}
                type="button"
              >
                <Icon className="text-[17px]">delete</Icon>
                <span className="hidden sm:inline">Delete Board</span>
              </button>
            </div>
          ) : null}
        </section>

        <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {boardLists.length > 0
            ? boardLists.map((list) => (
                <BoardColumn key={list.id} list={list} />
              ))
            : ["To Do", "In Progress", "Review", "Done"].map((title) => (
                <BoardColumn
                  key={title}
                  list={{ boardId: board.id, cards: [], id: title, title }}
                />
              ))}
        </section>
      </PageContainer>

      <EditBoardDialog
        board={board}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={(input) => {
          setBoards((current) =>
            current.map((item) =>
              item.id === board.id
                ? {
                    ...item,
                    description: input.description,
                    title: input.title,
                    updatedLabel: "Updated just now",
                  }
                : item,
            ),
          );
          showToast("Board changes saved successfully");
        }}
      />
      <DeleteBoardDialog
        boardTitle={board.title}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onDelete={() => {
          setBoards((current) =>
            current.filter((item) => item.id !== board.id),
          );
          showToast("Deleting board... Redirecting to workspace");
          window.setTimeout(
            () => navigate(`/organizations/${organization.id}/boards`),
            700,
          );
        }}
      />
      {toast ? <Toast message={toast} /> : null}
    </AppShell>
  );
}

function BoardsStateBar({
  onCreate,
  onSelect,
  role,
  view,
}: {
  onCreate: () => void;
  onSelect: (view: BoardView, role: "owner" | "member") => void;
  role: "owner" | "member";
  view: BoardView;
}) {
  return (
    <div className="flex w-full flex-col justify-between gap-3 bg-[var(--surface-container-high)]/60 px-4 py-1.5 shadow-sm lg:flex-row lg:items-center lg:px-6">
      <span className="flex items-center gap-1 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-2">
        <Icon className="text-[14px]">tune</Icon> UI State Engine:
      </span>
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-[var(--surface-container)] p-0.5 shadow-sm">
        <StateButton
          active={view === "grid" && role === "owner"}
          onClick={() => onSelect("grid", "owner")}
        >
          Boards Grid
        </StateButton>
        <StateButton active={false} onClick={onCreate}>
          Create Board Modal
        </StateButton>
        <StateButton
          active={view === "empty"}
          onClick={() => onSelect("empty", "owner")}
        >
          Empty State
        </StateButton>
        <StateButton
          active={view === "loading"}
          onClick={() => onSelect("loading", "owner")}
        >
          Loading State
        </StateButton>
        <StateButton
          active={role === "member"}
          onClick={() => onSelect("grid", "member")}
        >
          Member View
        </StateButton>
      </div>
    </div>
  );
}

function StateButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`shrink-0 rounded-md px-3 py-1 text-[13px] ${active ? "bg-surface font-medium text-ink shadow-sm" : "text-ink-2 hover:text-ink"}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
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
      className="group flex min-h-[220px] flex-col justify-between rounded-xl bg-surface p-6 shadow-sm hover:shadow-md"
      to={`/organizations/${organizationId}/boards/${board.id}`}
    >
      <div>
        <div className="mb-2 flex items-start justify-between gap-2">
          <StatusPill board={board} />
          <div className="flex items-center gap-1 text-ink-3">
            <span title="Star board">
              <Icon className="text-[18px]">star</Icon>
            </span>
            <span title="More options">
              <Icon className="text-[18px]">more_horiz</Icon>
            </span>
          </div>
        </div>
        <h2 className="text-xl font-semibold leading-7 text-ink group-hover:text-accent">
          {board.title}
        </h2>
        <p className="line-clamp-2 mt-2 text-[15px] leading-[22px] text-ink-2">
          {board.description}
        </p>
      </div>
      <div className="mt-6 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-mono text-[10px] font-medium text-ink-2">
          <BoardAvatarPile avatars={board.memberAvatars} />
          {board.activeMembers} active members
        </span>
        <span className="flex items-center gap-1 text-[13px] text-ink-3">
          <Icon className="text-[15px]">schedule</Icon>
          {board.updatedLabel}
        </span>
      </div>
    </Link>
  );
}

function StatusPill({ board }: { board: MockBoard }) {
  const color =
    board.statusTone === "success"
      ? "text-success"
      : board.statusTone === "warning"
        ? "text-[var(--role-owner-fg)]"
        : board.statusTone === "accent"
          ? "text-[var(--purple)]"
          : "text-ink-2";
  return (
    <span
      className={`flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] ${color}`}
    >
      <span className="h-2.5 w-2.5 rounded-full bg-current" />
      {board.status}
    </span>
  );
}

function RolePill({ role }: { role: string }) {
  const owner = role === "OWNER" || role === "ADMIN";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] shadow-sm ${owner ? "bg-[var(--role-owner-bg)] text-[var(--role-owner-fg)]" : "bg-surface-raised text-ink-2"}`}
    >
      <Icon className="text-[12px]">
        {owner ? "verified_user" : "visibility"}
      </Icon>
      {role}
    </span>
  );
}

function BoardAvatarPile({ avatars }: { avatars: string[] }) {
  if (avatars.length === 0) return null;

  return (
    <span className="flex -space-x-1 overflow-hidden">
      {avatars.slice(0, 3).map((avatar) => (
        <img
          alt=""
          className="h-5 w-5 rounded-full object-cover ring-2 ring-surface"
          key={avatar}
          src={avatar}
        />
      ))}
    </span>
  );
}

function BoardColumn({ list }: { list: MockList }) {
  const colors = [
    "bg-ink-3",
    "bg-[var(--purple)]",
    "bg-[var(--role-owner-fg)]",
    "bg-success",
  ];
  const color = colors[Math.abs(list.title.length) % colors.length];
  return (
    <div className="flex min-h-[460px] flex-col gap-4 rounded-xl bg-surface/60 p-4 shadow-sm">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
          <h2 className="text-base font-semibold text-accent">{list.title}</h2>
          <span className="rounded-full bg-[var(--surface-container)] px-2 py-0.5 font-mono text-[10px] text-ink-2">
            {list.cards.length}
          </span>
        </div>
        <Icon className="text-[18px] text-ink-3">add</Icon>
      </div>
      <div className="flex flex-col gap-3">
        {list.cards.length > 0 ? (
          list.cards.map((card) => <TaskCard card={card} key={card.id} />)
        ) : (
          <div className="rounded-lg bg-[var(--surface-container-low)] p-6 text-center">
            <Icon className="text-ink-3">post_add</Icon>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
              Empty Column Tray
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskCard({ card }: { card: MockCard }) {
  return (
    <article className="rounded-lg bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span
          className={`font-mono text-[11px] font-semibold uppercase tracking-[0.08em] ${card.done ? "text-success" : "text-[var(--role-owner-fg)]"}`}
        >
          {card.labels?.[0] ?? "Task"}
        </span>
        <span className="font-mono text-[10px] font-semibold text-accent">
          {card.priority ?? card.meta}
        </span>
      </div>
      <h3
        className={`mt-2 text-[13px] font-medium text-ink ${card.done ? "line-through opacity-70" : ""}`}
      >
        {card.title}
      </h3>
      {card.description ? (
        <p className="mt-1 text-[13px] text-ink-2">{card.description}</p>
      ) : null}
      <div className="mt-3 flex items-center justify-between">
        {card.assigneeInitials ? (
          <span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-[9px] text-accent-fg">
            {card.assigneeInitials}
          </span>
        ) : (
          <span className="h-5 w-5 rounded-full bg-[var(--surface-container)]" />
        )}
        {card.meta ? (
          <span className="font-mono text-[10px] text-ink-2">{card.meta}</span>
        ) : (
          <Icon className="text-[14px] text-ink-3">schedule</Icon>
        )}
      </div>
    </article>
  );
}

function BoardsSkeleton() {
  return (
    <div className="grid animate-pulse grid-cols-1 gap-6 md:grid-cols-2">
      {[1, 2].map((item) => (
        <div
          className="space-y-4 rounded-xl bg-surface p-6 shadow-sm"
          key={item}
        >
          <div className="h-6 w-3/4 rounded bg-[var(--surface-container-highest)]" />
          <div className="h-4 rounded bg-[var(--surface-container)]" />
          <div className="h-4 w-2/3 rounded bg-[var(--surface-container)]" />
        </div>
      ))}
    </div>
  );
}

function BoardsEmpty({
  canCreate,
  onCreate,
}: {
  canCreate: boolean;
  onCreate: () => void;
}) {
  return (
    <section className="mx-auto max-w-md rounded-2xl bg-surface p-10 text-center shadow-sm">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[var(--surface-container-low)] text-ink-3">
        <Icon className="text-[32px]">folder_off</Icon>
      </span>
      <h2 className="mt-4 text-xl font-semibold text-ink">
        No boards in this organization yet
      </h2>
      <p className="mt-2 text-[13px] text-ink-2">
        Get your team aligned by organizing tasks, sprints, and product roadmaps
        with your first shared board.
      </p>
      {canCreate ? (
        <button
          className="mx-auto mt-6 flex h-9 items-center gap-1.5 rounded-lg bg-accent px-4 text-[13px] font-medium text-accent-fg"
          onClick={onCreate}
          type="button"
        >
          <Icon className="text-[18px]">add</Icon>Create First Board
        </button>
      ) : null}
    </section>
  );
}

function CreateBoardDialog({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: { description: string; title: string }) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    onCreate({ description: description.trim(), title: title.trim() });
    setTitle("");
    setDescription("");
    onClose();
  }

  if (!isOpen) return null;
  return (
    <DialogShell
      onClose={onClose}
      title="Create New Board"
      subtitle="Deploy a dedicated workspace for roadmaps, sprints, or team pipelines."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <TextInput
          label="Board Title"
          onChange={setTitle}
          placeholder="e.g. Platform Core Infrastructure"
          required
          value={title}
        />
        <TextareaInput
          label="Description"
          onChange={setDescription}
          placeholder="Summarize goals, deliverable scope, or sprint outcomes..."
          value={description}
        />
        <div>
          <span className="mb-2 block text-[13px] font-medium text-ink">
            Initial Visibility
          </span>
          <div className="grid grid-cols-2 gap-2">
            <Choice
              title="Organization"
              detail="Visible to all members"
              checked
            />
            <Choice title="Private Invite" detail="Specific admins only" />
          </div>
        </div>
        <DialogActions onClose={onClose} submitLabel="Create Board" />
      </form>
    </DialogShell>
  );
}

function EditBoardDialog({
  board,
  isOpen,
  onClose,
  onSave,
}: {
  board: MockBoard;
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: { description: string; title: string }) => void;
}) {
  const [title, setTitle] = useState(board.title);
  const [description, setDescription] = useState(board.description ?? "");
  if (!isOpen) return null;
  return (
    <DialogShell
      onClose={onClose}
      title="Edit Board Details"
      subtitle="Modify workspace title, mission, and scope."
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSave({ description, title });
          onClose();
        }}
      >
        <TextInput
          label="Board Title"
          onChange={setTitle}
          required
          value={title}
        />
        <TextareaInput
          label="Board Description"
          onChange={setDescription}
          value={description}
        />
        <div className="flex items-center justify-between rounded-lg bg-[var(--surface-container)] p-3 text-[13px] text-ink-2">
          <span className="flex items-center gap-2">
            <Icon className="text-[18px] text-[var(--role-owner-fg)]">
              lock_open
            </Icon>
            Organization visibility: Internal
          </span>
          <span className="font-mono text-[11px] uppercase text-ink-3">
            Default
          </span>
        </div>
        <DialogActions onClose={onClose} submitLabel="Save Changes" />
      </form>
    </DialogShell>
  );
}

function DeleteBoardDialog({
  boardTitle,
  isOpen,
  onClose,
  onDelete,
}: {
  boardTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}) {
  if (!isOpen) return null;
  return (
    <DialogShell
      onClose={onClose}
      title="Delete Board"
      destructive
      subtitle="Destructive Action"
    >
      <div className="rounded-xl bg-[var(--surface-container-low)] p-4">
        <p className="text-[15px] text-ink">
          Are you sure you want to delete <strong>{boardTitle}</strong>?
        </p>
        <p className="mt-2 text-[13px] text-ink-2">
          This action cannot be undone and associated mock board data will be
          removed from this session.
        </p>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button
          className="h-9 rounded-md bg-[var(--surface-container)] px-4 text-sm font-medium text-ink hover:bg-[var(--surface-container-high)]"
          onClick={onClose}
          type="button"
        >
          Cancel
        </button>
        <button
          className="flex h-9 items-center gap-1.5 rounded-md bg-danger px-4 text-sm font-medium text-danger-fg"
          onClick={() => {
            onDelete();
            onClose();
          }}
          type="button"
        >
          <Icon className="text-[17px]">delete_forever</Icon>Delete Board
        </button>
      </div>
    </DialogShell>
  );
}

function DialogShell({
  children,
  destructive = false,
  onClose,
  subtitle,
  title,
}: {
  children: ReactNode;
  destructive?: boolean;
  onClose: () => void;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--accent-hover)]/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-surface p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {destructive ? (
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--destructive-wash)] text-danger">
                <Icon>warning</Icon>
              </span>
            ) : null}
            <div>
              <h2 className="text-xl font-semibold text-accent">{title}</h2>
              <p
                className={`mt-1 text-[13px] ${destructive ? "font-mono uppercase tracking-[0.08em] text-danger" : "text-ink-2"}`}
              >
                {subtitle}
              </p>
            </div>
          </div>
          <button
            className="rounded-lg p-1 text-ink-3 hover:bg-[var(--surface-container)] hover:text-ink"
            onClick={onClose}
            type="button"
          >
            <Icon>close</Icon>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TextInput({
  label,
  onChange,
  placeholder = "",
  required = false,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[13px] font-medium text-ink">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </span>
      <input
        className="h-10 w-full rounded-lg bg-[var(--surface-container-low)] px-3 text-[13px] text-ink outline-none focus:ring-2 focus:ring-accent/20"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        value={value}
      />
    </label>
  );
}

function TextareaInput({
  label,
  onChange,
  placeholder = "",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[13px] font-medium text-ink">
        {label}
      </span>
      <textarea
        className="min-h-24 w-full resize-none rounded-lg bg-[var(--surface-container-low)] p-3 text-[13px] text-ink outline-none focus:ring-2 focus:ring-accent/20"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

function Choice({
  checked = false,
  detail,
  title,
}: {
  checked?: boolean;
  detail: string;
  title: string;
}) {
  return (
    <label className="flex cursor-pointer gap-2 rounded-lg bg-[var(--surface-container-low)] p-3">
      <input
        className="accent-black"
        defaultChecked={checked}
        name="board-vis"
        type="radio"
      />
      <span>
        <span className="block text-[13px] font-medium text-ink">{title}</span>
        <span className="font-mono text-[10px] text-ink-2">{detail}</span>
      </span>
    </label>
  );
}

function DialogActions({
  onClose,
  submitLabel,
}: {
  onClose: () => void;
  submitLabel: string;
}) {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <button
        className="h-9 rounded-lg bg-[var(--surface-container)] px-4 text-sm font-medium text-ink hover:bg-[var(--surface-container-high)]"
        onClick={onClose}
        type="button"
      >
        Cancel
      </button>
      <button
        className="flex h-9 items-center gap-1.5 rounded-lg bg-accent px-5 text-sm font-medium text-accent-fg"
        type="submit"
      >
        <Icon className="text-[16px]">check</Icon>
        {submitLabel}
      </button>
    </div>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-[var(--accent-hover)] px-4 py-2.5 text-sm font-medium text-white shadow-xl">
      <Icon className="text-[18px] text-success">check_circle</Icon>
      {message}
    </div>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="rounded-xl bg-surface p-8 shadow-sm">
      <h1 className="text-xl font-semibold text-ink">{message}</h1>
    </div>
  );
}
