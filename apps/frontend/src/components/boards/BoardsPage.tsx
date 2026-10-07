import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createBoard,
  deleteBoard,
  addBoardMember,
  getBoard,
  getBoardMembers,
  getBoards,
  removeBoardMember,
  updateBoard,
} from "../../lib/api/board";
import {
  createCard,
  deleteCard,
  moveCard,
  updateCard,
} from "../../lib/api/card";
import {
  getOrganizationMembers,
  getOrganizations,
  type OrganizationMember,
} from "../../lib/api/organization";
import {
  createList,
  deleteList,
  getLists,
  updateList,
} from "../../lib/api/list";
import { canPerformBoardAction } from "../../lib/permissions";
import { getStoredUser } from "../../lib/api/auth";
import type {
  ApiOrganization,
  Board,
  BoardList,
  BoardMember,
  MockBoard,
  MockCard,
  MockList,
} from "../../types/taskforge";
import { AppShell, Icon, PageContainer } from "../layout/AppShell";
import { Breadcrumb } from "../layout/Breadcrumb";
import { socket } from "../../lib/socket";

type BoardView = "grid" | "empty" | "loading";
const LIST_DRAG_TYPE = "application/x-taskforge-list";

export function BoardsPage() {
  const { organizationId, boardId } = useParams();
  const [organization, setOrganization] = useState<ApiOrganization | null>(
    null,
  );
  const [boards, setBoards] = useState<Board[]>([]);
  const [view, setView] = useState<BoardView>("loading");
  const [query, setQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toast, setToast] = useState("");
  useEffect(() => {
    async function loadWorkspace() {
      if (!organizationId) {
        setView("empty");
        return;
      }

      try {
        setView("loading");
        const [organizationList, boardList] = await Promise.all([
          getOrganizations(),
          getBoards(organizationId),
        ]);
        const nextOrganization = organizationList.find(
          (item) => item.id === organizationId,
        );

        if (!nextOrganization) {
          setView("empty");
          return;
        }

        setOrganization(nextOrganization);
        setBoards(boardList);
        setView(boardList.length ? "grid" : "empty");
      } catch {
        setView("empty");
      }
    }

    loadWorkspace();
  }, [organizationId]);
  useEffect(() => {
    if (!boardId) return;

    socket.connect();

    socket.emit("join-board", boardId);

    return () => {
      socket.emit("leave-board", boardId);
      socket.disconnect();
    };
  }, [boardId]);
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
          {view === "loading" ? (
            <BoardsSkeleton />
          ) : (
            <ErrorPanel message="Unable to load workspace." />
          )}
        </PageContainer>
      </AppShell>
    );
  }

  const canCreate = canPerformBoardAction(organization.role, "create");

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  }

  return (
    <AppShell>
      <PageContainer>
        <Breadcrumb
          items={[
            { label: "Organizations", to: "/organizations" },
            { label: organization.name },
            { label: "Boards" },
          ]}
        />

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
              <RolePill role={organization.role} />
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
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {organizationBoards.map((board) => (
                <BoardCard
                  board={toMockBoard(board)}
                  key={board.id}
                  organizationId={organization.id}
                />
              ))}
              {canCreate ? (
                <CreateBoardCard onCreate={() => setIsCreateOpen(true)} />
              ) : null}
            </div>
          </section>
        ) : null}
      </PageContainer>
      <CreateBoardDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={async (input) => {
          const board = await createBoard(organization.id, input);
          setBoards((current) => [board, ...current]);
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
  const { boardId, organizationId } = useParams();

  const [organization, setOrganization] = useState<ApiOrganization | null>(
    null,
  );
  const [board, setBoard] = useState<MockBoard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [boardLists, setBoardLists] = useState<MockList[]>([]);
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [isCreateListOpen, setIsCreateListOpen] = useState(false);
  const [editingList, setEditingList] = useState<MockList | null>(null);
  const [cardDialog, setCardDialog] = useState<{
    card?: MockCard;
    listId: string;
  } | null>(null);
  const [draggingCard, setDraggingCard] = useState<MockCard | null>(null);
  const [confirmation, setConfirmation] = useState<{
    message: string;
    onConfirm: () => void | Promise<void>;
  } | null>(null);

  useEffect(() => {
    async function loadBoard() {
      if (!organizationId || !boardId) {
        setLoadError("Board not found.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError("");

        const [organizationList, boardData, listData, memberData] =
          await Promise.all([
            getOrganizations(),
            getBoard(organizationId, boardId),
            getLists(organizationId, boardId),
            getBoardMembers(organizationId, boardId),
          ]);

        const nextOrganization = organizationList.find(
          (item) => item.id === organizationId,
        );

        if (!nextOrganization) {
          setLoadError("Organization not found.");
          return;
        }

        setOrganization(nextOrganization);
        setBoard(toMockBoard(boardData));
        setBoardMembers(memberData);
        setBoardLists(
          listData
            .map((list) => ({
              boardId: list.boardId,
              cards: list.cards.map((card) => ({
                description: card.description ?? undefined,
                id: card.id,
                listId: card.listId,
                position: card.position,
                title: card.title,
              })),
              id: list.id,
              position: list.position,
              title: list.title,
            }))
            .sort((left, right) => left.position - right.position),
        );
      } catch {
        setLoadError("Unable to load board.");
      } finally {
        setIsLoading(false);
      }
    }

    loadBoard();
  }, [organizationId, boardId]);
  useEffect(() => {
    if (!boardId) return;

    socket.connect();
    socket.emit("join-board", boardId);

    return () => {
      socket.emit("leave-board", boardId);
      socket.disconnect();
    };
  }, [boardId]);
  useEffect(() => {
    const handleListCreated = (newList: BoardList) => {
      setBoardLists((current) => {
        if (current.some((list) => list.id === newList.id)) return current;
        return [...current, { ...newList, cards: [] }].sort(
          (left, right) => left.position - right.position,
        );
      });
    };
    const handleListUpdated = (updatedList: BoardList) => {
      replaceList(updatedList.id, (list) => ({
        ...list,
        title: updatedList.title,
        position: updatedList.position,
      }));
    };
    const handleListDeleted = (deletedListId: string) => {
      setBoardLists((current) =>
        current.filter((list) => list.id !== deletedListId),
      );
    };
    const handleCardCreated = (newCard: MockCard) => {
      console.log("CARD CREATED RECEIVED:", newCard);

      setBoardLists((current) =>
        current.map((list) => {
          if (list.id !== newCard.listId) return list;
          return { ...list, cards: [...list.cards, newCard] };
        }),
      );
    };

    socket.on("list-created", handleListCreated);
    socket.on("list-updated", handleListUpdated);
    socket.on("list-deleted", handleListDeleted);
    socket.on("card-created", handleCardCreated);

    return () => {
      socket.off("list-created", handleListCreated);
      socket.off("list-updated", handleListUpdated);
      socket.off("list-deleted", handleListDeleted);
      socket.off("card-created", handleCardCreated);
    };
  }, []);

  if (isLoading) {
    return (
      <AppShell>
        <PageContainer>
          <BoardsSkeleton />
        </PageContainer>
      </AppShell>
    );
  }

  if (loadError || !organization || !board) {
    return (
      <AppShell>
        <PageContainer>
          <ErrorPanel message={loadError || "Board not found."} />
        </PageContainer>
      </AppShell>
    );
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  }

  const currentUser = getStoredUser();
  const canManage =
    board.ownerId === currentUser?.id ||
    canPerformBoardAction(organization.role, "edit");
  const currentOrganization = organization;
  const currentBoard = board;

  function replaceList(listId: string, update: (list: MockList) => MockList) {
    setBoardLists((current) =>
      current
        .map((list) => (list.id === listId ? update(list) : list))
        .sort((left, right) => left.position - right.position),
    );
  }

  async function handleCreateList(title: string) {
    await createList(currentOrganization.id, currentBoard.id, {
      position:
        boardLists.reduce(
          (highestPosition, list) => Math.max(highestPosition, list.position),
          -1,
        ) + 1,
      title,
    });

    setIsCreateListOpen(false);
    showToast("List created successfully");
  }

  async function handleSaveList(
    listId: string,
    input: { title?: string; position?: number },
  ) {
    await updateList(currentOrganization.id, currentBoard.id, listId, input);
    setEditingList(null);
    showToast("List updated successfully");
  }

  async function handleDropList(
    sourceListId: string,
    targetListId: string,
    insertAfter: boolean,
  ) {
    if (sourceListId === targetListId) return;

    const source = boardLists.find((list) => list.id === sourceListId);
    const targetIndex = boardLists.findIndex(
      (list) => list.id === targetListId,
    );
    if (!source || targetIndex === -1) return;

    const reordered = boardLists.filter((list) => list.id !== sourceListId);
    const adjustedTargetIndex = reordered.findIndex(
      (list) => list.id === targetListId,
    );
    const insertIndex = adjustedTargetIndex + (insertAfter ? 1 : 0);
    reordered.splice(insertIndex, 0, source);
    if (reordered.every((list, index) => list.id === boardLists[index]?.id))
      return;

    const previous = reordered[insertIndex - 1];
    const next = reordered[insertIndex + 1];
    const position =
      previous && next
        ? (previous.position + next.position) / 2
        : previous
          ? previous.position + 1
          : next
            ? next.position - 1
            : 0;
    const needsReindex =
      !Number.isFinite(position) ||
      (previous && position === previous.position) ||
      (next && position === next.position);

    try {
      if (needsReindex) {
        const normalized = reordered.map((list, index) => ({
          ...list,
          position: index,
        }));
        await Promise.all(
          normalized.map((list) =>
            updateList(currentOrganization.id, currentBoard.id, list.id, {
              position: list.position,
            }),
          ),
        );
        setBoardLists(normalized);
      } else {
        await updateList(
          currentOrganization.id,
          currentBoard.id,
          sourceListId,
          {
            position,
          },
        );
        setBoardLists(
          reordered
            .map((list) =>
              list.id === sourceListId ? { ...list, position } : list,
            )
            .sort((left, right) => left.position - right.position),
        );
      }
    } catch {
      showToast("Unable to reorder lists");
    }
  }

  async function handleDeleteList(list: MockList) {
    await deleteList(currentOrganization.id, currentBoard.id, list.id);
    setBoardLists((current) => current.filter((item) => item.id !== list.id));
    showToast("List deleted successfully");
  }

  async function handleCreateCard(
    listId: string,
    title: string,
    description: string,
  ) {
    const created = await createCard(currentBoard.id, listId, {
      description,
      title,
    });
    replaceList(listId, (list) => ({
      ...list,
      cards: [
        ...list.cards,
        {
          description: created.description ?? undefined,
          id: created.id,
          listId,
          position: created.position,
          title: created.title,
        },
      ],
    }));
    setCardDialog(null);
    showToast("Card created successfully");
  }

  async function handleSaveCard(
    cardId: string,
    title: string,
    description: string,
  ) {
    const updated = await updateCard(cardId, { description, title });
    setBoardLists((current) =>
      current.map((list) => ({
        ...list,
        cards: list.cards.map((card) =>
          card.id === cardId
            ? {
                ...card,
                description: updated.description ?? undefined,
                title: updated.title,
              }
            : card,
        ),
      })),
    );
    setCardDialog(null);
    showToast("Card updated successfully");
  }

  async function handleDeleteCard(card: MockCard) {
    await deleteCard(card.id);
    setBoardLists((current) =>
      current.map((list) => ({
        ...list,
        cards: list.cards.filter((item) => item.id !== card.id),
      })),
    );
    showToast("Card deleted successfully");
  }

  async function handleMoveCard(card: MockCard, targetListId: string) {
    const targetList = boardLists.find((list) => list.id === targetListId);
    if (!targetList) return;
    await handleDropCard(card, targetListId, targetList.cards.length);
  }

  async function handleDropCard(
    card: MockCard,
    targetListId: string,
    position: number,
  ) {
    if (!card.listId) return;
    if (card.listId === targetListId) {
      const sourceList = boardLists.find((list) => list.id === card.listId);
      const currentPosition = sourceList?.cards.findIndex(
        (item) => item.id === card.id,
      );
      if (currentPosition === position || currentPosition === position - 1)
        return;
    }

    await moveCard(card.id, targetListId, position);
    setBoardLists((current) =>
      current.map((list) => {
        const withoutCard = list.cards.filter((item) => item.id !== card.id);
        if (list.id !== targetListId) return { ...list, cards: withoutCard };

        const nextCards = [...withoutCard];
        nextCards.splice(Math.min(position, nextCards.length), 0, {
          ...card,
          listId: targetListId,
        });
        return { ...list, cards: nextCards };
      }),
    );
    setDraggingCard(null);
    showToast("Card moved successfully");
  }

  return (
    <AppShell>
      <PageContainer>
        <div className="-mt-5">
          <Breadcrumb
            items={[
              { label: "Organizations", to: "/organizations" },
              {
                label: organization.name,
                to: `/organizations/${organization.id}/boards`,
              },
              {
                label: "Boards",
                to: `/organizations/${organization.id}/boards`,
              },
              { label: board.title },
            ]}
          />
        </div>

        <section className="border-b border-line pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill board={board} />
                <RolePill role={organization.role} />
                <span className="text-xs text-ink-3">{board.updatedLabel}</span>
              </div>
              <h1 className="mt-1 text-3xl font-semibold leading-9 tracking-normal text-accent lg:text-4xl lg:leading-10">
                {board.title}
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm leading-5 text-ink-2">
                {board.description}
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-3">
                Board details <span className="mx-1 text-line-strong">/</span>{" "}
                ID: {board.id}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2 lg:pt-1">
              <button
                className="flex h-8 items-center gap-2 rounded-md border border-line bg-surface px-2.5 text-xs font-medium text-ink-2 hover:border-line-strong hover:bg-surface-raised hover:text-ink"
                onClick={() => setIsMembersOpen(true)}
                type="button"
              >
                <BoardMemberAvatars members={boardMembers} />
                <span>Members {boardMembers.length}</span>
              </button>
              {canManage ? (
                <>
                  <button
                    className="flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 text-xs font-medium text-ink-2 hover:border-line-strong hover:bg-surface-raised hover:text-ink"
                    onClick={() => setIsEditOpen(true)}
                    type="button"
                  >
                    <Icon className="text-[16px]">edit</Icon>Edit
                  </button>
                  <button
                    aria-label="Delete board"
                    className="grid h-8 w-8 place-items-center rounded-md border border-line bg-surface text-ink-3 hover:border-danger hover:bg-[var(--destructive-wash)] hover:text-danger"
                    onClick={() => setIsDeleteOpen(true)}
                    title="Delete board"
                    type="button"
                  >
                    <Icon className="text-[17px]">delete</Icon>
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </section>

        <section className="app-scrollbar mt-4 flex min-h-[360px] gap-3 overflow-x-auto pb-3">
          {boardLists.length > 0 ? (
            boardLists.map((list) => (
              <BoardColumn
                canManage={canManage}
                key={list.id}
                list={list}
                lists={boardLists}
                onDropList={handleDropList}
                onAddCard={() => setCardDialog({ listId: list.id })}
                onDeleteCard={(card) =>
                  setConfirmation({
                    message: `Delete "${card.title}"?`,
                    onConfirm: () => handleDeleteCard(card),
                  })
                }
                onDeleteList={(list) =>
                  setConfirmation({
                    message: `Delete "${list.title}" and all its cards?`,
                    onConfirm: () => handleDeleteList(list),
                  })
                }
                onEditCard={(card) => setCardDialog({ card, listId: list.id })}
                onEditList={setEditingList}
                onMoveCard={handleMoveCard}
                onDropCard={(position) => {
                  if (draggingCard) {
                    void handleDropCard(draggingCard, list.id, position);
                  }
                }}
                onDragStart={setDraggingCard}
                onDragEnd={() => setDraggingCard(null)}
              />
            ))
          ) : (
            <div className="flex min-w-[260px] items-center justify-center rounded-lg border border-dashed border-line-strong bg-surface p-6 text-center">
              <Icon className="text-[28px] text-ink-3">view_column</Icon>
              <div className="ml-3 text-left">
                <p className="text-sm font-medium text-ink">No lists yet</p>
                {canManage ? (
                  <button
                    className="mt-1 text-xs font-medium text-accent hover:underline"
                    onClick={() => setIsCreateListOpen(true)}
                    type="button"
                  >
                    + Add list
                  </button>
                ) : null}
              </div>
            </div>
          )}
          {canManage ? (
            <button
              className="flex min-h-[300px] min-w-[150px] flex-col items-center justify-center rounded-lg border border-dashed border-line-strong bg-surface/70 px-4 text-center text-ink-3 hover:border-accent hover:bg-surface-raised hover:text-accent"
              onClick={() => setIsCreateListOpen(true)}
              type="button"
            >
              <Icon className="text-[20px]">add</Icon>
              <span className="mt-1 text-xs font-medium">Add list</span>
            </button>
          ) : null}
        </section>
      </PageContainer>

      <EditBoardDialog
        board={board}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={async (input) => {
          try {
            const updatedBoard = await updateBoard(
              organization.id,
              board.id,
              input,
            );
            setBoard(toMockBoard(updatedBoard));
            showToast("Board changes saved successfully");
          } catch {
            showToast("Unable to save board changes");
          }
        }}
      />
      <DeleteBoardDialog
        boardTitle={board.title}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onDelete={async () => {
          try {
            await deleteBoard(organization.id, board.id);
            showToast("Board deleted. Redirecting to workspace");
            window.setTimeout(
              () => navigate(`/organizations/${organization.id}/boards`),
              700,
            );
          } catch {
            showToast("Unable to delete board");
          }
        }}
      />
      {toast ? <Toast message={toast} /> : null}
      <ListDialog
        isOpen={isCreateListOpen}
        onClose={() => setIsCreateListOpen(false)}
        onSave={handleCreateList}
        title="Create List"
      />
      <ListDialog
        key={editingList?.id ?? "create-list"}
        initialTitle={editingList?.title}
        isOpen={Boolean(editingList)}
        onClose={() => setEditingList(null)}
        onSave={async (title) => {
          if (editingList) await handleSaveList(editingList.id, { title });
        }}
        title="Edit List"
      />
      <CardDialog
        key={cardDialog?.card?.id ?? cardDialog?.listId ?? "card"}
        card={cardDialog?.card}
        isOpen={Boolean(cardDialog)}
        onClose={() => setCardDialog(null)}
        onSave={async (title, description) => {
          if (!cardDialog) return;
          if (cardDialog.card) {
            await handleSaveCard(cardDialog.card.id, title, description);
          } else {
            await handleCreateCard(cardDialog.listId, title, description);
          }
        }}
      />
      <BoardMembersDialog
        boardId={board.id}
        canManage={canManage}
        isOpen={isMembersOpen}
        members={boardMembers}
        onChanged={async () => {
          const nextMembers = await getBoardMembers(organization.id, board.id);
          setBoardMembers(nextMembers);
        }}
        onClose={() => setIsMembersOpen(false)}
        organization={organization}
      />
      <ConfirmDialog
        isOpen={Boolean(confirmation)}
        message={confirmation?.message ?? ""}
        onClose={() => setConfirmation(null)}
        onConfirm={async () => {
          if (confirmation) await confirmation.onConfirm();
          setConfirmation(null);
        }}
      />
    </AppShell>
  );
}

function toMockBoard(board: Board): MockBoard {
  return {
    ...board,
    activeMembers: 0,
    memberAvatars: [],
    status: "Active",
    statusTone: "success",
    updatedLabel: `Updated ${new Date(board.updatedAt).toLocaleDateString()}`,
  };
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
      className="group flex min-h-[180px] flex-col justify-between rounded-lg border border-line bg-surface p-5 shadow-[var(--shadow-sm)] hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[var(--shadow-md)]"
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
        <h2 className="text-lg font-semibold leading-6 text-ink group-hover:text-accent">
          {board.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-ink-2">
          {board.description}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-mono text-[10px] font-medium text-ink-2">
          <BoardAvatarPile avatars={board.memberAvatars} />
          Board workspace
        </span>
        <span className="flex items-center gap-1 text-[13px] text-ink-3">
          <Icon className="text-[15px]">schedule</Icon>
          {board.updatedLabel}
        </span>
      </div>
    </Link>
  );
}

function CreateBoardCard({ onCreate }: { onCreate: () => void }) {
  return (
    <button
      className="group flex min-h-[180px] flex-col items-center justify-center rounded-lg border border-dashed border-line-strong bg-surface p-5 text-center hover:-translate-y-0.5 hover:border-accent hover:bg-surface-raised"
      onClick={onCreate}
      type="button"
    >
      <span className="grid h-10 w-10 place-items-center rounded-full bg-surface-raised text-accent group-hover:bg-accent group-hover:text-accent-fg">
        <Icon>add</Icon>
      </span>
      <span className="mt-3 text-sm font-semibold text-ink">
        Create new board
      </span>
      <span className="mt-1 text-xs text-ink-3">Start a new project board</span>
    </button>
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

function BoardMemberAvatars({ members }: { members: BoardMember[] }) {
  return (
    <span className="flex -space-x-1.5">
      {members.slice(0, 3).map((member) =>
        member.avatarUrl ? (
          <img
            alt=""
            className="h-5 w-5 rounded-full object-cover ring-2 ring-[var(--surface-container)]"
            key={member.id}
            src={member.avatarUrl}
          />
        ) : (
          <span
            className="grid h-5 w-5 place-items-center rounded-full bg-accent text-[8px] font-semibold text-accent-fg ring-2 ring-[var(--surface-container)]"
            key={member.id}
          >
            {member.name.slice(0, 1).toUpperCase()}
          </span>
        ),
      )}
    </span>
  );
}

function BoardMembersDialog({
  boardId,
  canManage,
  isOpen,
  members,
  onChanged,
  onClose,
  organization,
}: {
  boardId: string;
  canManage: boolean;
  isOpen: boolean;
  members: BoardMember[];
  onChanged: () => void | Promise<void>;
  onClose: () => void;
  organization: ApiOrganization;
}) {
  const [organizationMembers, setOrganizationMembers] = useState<
    OrganizationMember[]
  >([]);
  const [error, setError] = useState("");
  const [memberToRemove, setMemberToRemove] = useState<BoardMember | null>(
    null,
  );

  useEffect(() => {
    if (!isOpen || !canManage) return;
    getOrganizationMembers(organization.id)
      .then(setOrganizationMembers)
      .catch(() => setError("Unable to load organization members."));
  }, [canManage, isOpen, organization.id]);

  async function addMember(userId: string) {
    try {
      await addBoardMember(organization.id, boardId, userId);
      await onChanged();
    } catch {
      setError("Unable to add that member to the board.");
    }
  }

  async function removeMember(member: BoardMember) {
    if (member.role === "OWNER") return;
    try {
      await removeBoardMember(organization.id, boardId, member.id);
      await onChanged();
      setMemberToRemove(null);
    } catch {
      setError("Unable to remove that board member.");
    }
  }

  if (!isOpen) return null;
  const memberIds = new Set(members.map((member) => member.id));
  const availableMembers = organizationMembers.filter(
    (member) => !memberIds.has(member.id),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm">
      <section className="w-full max-w-lg rounded-xl bg-surface p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
              Board members
            </p>
            <h2 className="mt-1 text-xl font-semibold text-ink">
              {members.length} members
            </h2>
          </div>
          <button
            aria-label="Close board members"
            className="rounded-md p-1 text-ink-3 hover:bg-surface-raised hover:text-ink"
            onClick={onClose}
            type="button"
          >
            <Icon>close</Icon>
          </button>
        </div>
        {error ? (
          <p className="mt-4 rounded-md bg-[var(--destructive-wash)] p-3 text-sm text-danger">
            {error}
          </p>
        ) : null}
        <div className="mt-5 space-y-2">
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
                  {member.name.slice(0, 1).toUpperCase()}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  {member.name}
                </p>
                <p className="truncate text-xs text-ink-3">{member.email}</p>
              </div>
              <RolePill role={member.role} />
              {canManage && member.role !== "OWNER" ? (
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
        </div>
        {canManage ? (
          <div className="mt-6 border-t border-line pt-5">
            <p className="mb-2 text-sm font-medium text-ink">
              Add organization member
            </p>
            {!organizationMembers.length && !error ? (
              <p className="text-sm text-ink-3">Loading members...</p>
            ) : availableMembers.length === 0 ? (
              <p className="text-sm text-ink-3">
                All organization members are already on this board.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableMembers.map((member) => (
                  <button
                    className="rounded-md bg-surface-raised px-3 py-2 text-xs font-medium text-ink-2 hover:bg-[var(--surface-container-high)] hover:text-ink"
                    key={member.id}
                    onClick={() => void addMember(member.id)}
                    type="button"
                  >
                    Add {member.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </section>
      <ConfirmDialog
        isOpen={Boolean(memberToRemove)}
        message={
          memberToRemove ? `Remove ${memberToRemove.name} from this board?` : ""
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
        <h2 className="text-base font-semibold text-ink">Confirm action</h2>
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
            Confirm
          </button>
        </div>
      </section>
    </div>
  );
}

function BoardColumn({
  canManage,
  list,
  lists,
  onDropList,
  onAddCard,
  onDeleteCard,
  onDeleteList,
  onEditCard,
  onEditList,
  onMoveCard,
  onDropCard,
  onDragStart,
  onDragEnd,
}: {
  canManage: boolean;
  list: MockList;
  lists: MockList[];
  onDropList: (
    sourceListId: string,
    targetListId: string,
    insertAfter: boolean,
  ) => void;
  onAddCard: () => void;
  onDeleteCard: (card: MockCard) => void;
  onDeleteList: (list: MockList) => void;
  onEditCard: (card: MockCard) => void;
  onEditList: (list: MockList) => void;
  onMoveCard: (card: MockCard, targetListId: string) => void;
  onDropCard: (position: number) => void;
  onDragStart: (card: MockCard) => void;
  onDragEnd: () => void;
}) {
  const colors = [
    "bg-ink-3",
    "bg-[var(--purple)]",
    "bg-[var(--role-owner-fg)]",
    "bg-success",
  ];
  const color = colors[Math.abs(list.title.length) % colors.length];
  return (
    <div
      className="flex min-h-[300px] min-w-[260px] shrink-0 flex-col gap-2 rounded-lg border border-line bg-surface/70 p-3 shadow-[var(--shadow-sm)] lg:max-h-[calc(100vh-300px)]"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        const sourceListId = event.dataTransfer.getData(LIST_DRAG_TYPE);
        if (sourceListId) {
          event.preventDefault();
          event.stopPropagation();
          const bounds = event.currentTarget.getBoundingClientRect();
          onDropList(
            sourceListId,
            list.id,
            event.clientX >= bounds.left + bounds.width / 2,
          );
          return;
        }
        onDropCard(list.cards.length);
      }}
    >
      <div className="flex items-center justify-between border-b border-line pb-2">
        <div className="flex items-center gap-2">
          {canManage ? (
            <button
              aria-label={`Reorder ${list.title} list`}
              className="cursor-grab touch-none text-ink-3 active:cursor-grabbing"
              draggable
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData(LIST_DRAG_TYPE, list.id);
              }}
              title="Drag to reorder list"
              type="button"
            >
              <Icon className="text-[17px]">drag_indicator</Icon>
            </button>
          ) : null}
          <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
          <h2 className="text-sm font-semibold text-ink">{list.title}</h2>
          <span className="rounded-full bg-[var(--surface-container)] px-2 py-0.5 font-mono text-[10px] text-ink-2">
            {list.cards.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="rounded p-1 text-ink-3 hover:bg-[var(--surface-container)] hover:text-ink"
            onClick={onAddCard}
            title="Add card"
            type="button"
          >
            <Icon className="text-[17px]">add</Icon>
          </button>
          {canManage ? (
            <>
              <button
                className="rounded p-1 text-ink-3 hover:bg-[var(--surface-container)] hover:text-ink"
                onClick={() => onEditList(list)}
                title="Edit list"
                type="button"
              >
                <Icon className="text-[17px]">edit</Icon>
              </button>
              <button
                className="rounded p-1 text-ink-3 hover:bg-[var(--destructive-wash)] hover:text-danger"
                onClick={() => onDeleteList(list)}
                title="Delete list"
                type="button"
              >
                <Icon className="text-[17px]">delete</Icon>
              </button>
            </>
          ) : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
        {list.cards.length > 0 ? (
          list.cards.map((card, index) => (
            <TaskCard
              card={card}
              key={card.id}
              lists={lists}
              onDelete={() => onDeleteCard(card)}
              onEdit={() => onEditCard(card)}
              onMove={(targetListId) => onMoveCard(card, targetListId)}
              onDrop={() => onDropCard(index)}
              onDragStart={() => onDragStart(card)}
              onDragEnd={onDragEnd}
            />
          ))
        ) : (
          <div className="rounded-md bg-[var(--surface-container-low)] p-4 text-center">
            <Icon className="text-ink-3">post_add</Icon>
            <p className="text-xs text-ink-3">No cards yet</p>
            <button
              className="mt-2 text-xs font-medium text-accent hover:underline"
              onClick={onAddCard}
              type="button"
            >
              + Add card
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskCard({
  card,
  lists,
  onDelete,
  onEdit,
  onMove,
  onDrop,
  onDragStart,
  onDragEnd,
}: {
  card: MockCard;
  lists: MockList[];
  onDelete: () => void;
  onEdit: () => void;
  onMove: (listId: string) => void;
  onDrop: (position: number) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  return (
    <article
      className="cursor-grab rounded-md border border-line bg-surface p-3 shadow-[var(--shadow-sm)] active:cursor-grabbing"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        if (event.dataTransfer.getData(LIST_DRAG_TYPE)) return;
        event.stopPropagation();
        onDrop(0);
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className={`font-mono text-[11px] font-semibold uppercase tracking-[0.08em] ${card.done ? "text-success" : "text-[var(--role-owner-fg)]"}`}
        >
          {card.labels?.[0] ?? "Task"}
        </span>
        <div className="flex items-center gap-1">
          <button
            className="rounded p-1 text-ink-3 hover:text-ink"
            onClick={onEdit}
            title="Edit card"
            type="button"
          >
            <Icon className="text-[15px]">edit</Icon>
          </button>
          <button
            className="rounded p-1 text-ink-3 hover:text-danger"
            onClick={onDelete}
            title="Delete card"
            type="button"
          >
            <Icon className="text-[15px]">delete</Icon>
          </button>
        </div>
      </div>
      <h3
        className={`mt-1 text-[13px] font-medium leading-5 text-ink ${card.done ? "line-through opacity-70" : ""}`}
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
          <select
            className="max-w-[120px] rounded bg-[var(--surface-container)] px-1.5 py-1 text-[10px] text-ink-2 outline-none"
            onChange={(event) => onMove(event.target.value)}
            value={card.listId ?? ""}
          >
            <option value={card.listId ?? ""}>Move card...</option>
            {lists
              .filter((list) => list.id !== card.listId)
              .map((list) => (
                <option key={list.id} value={list.id}>
                  {list.title}
                </option>
              ))}
          </select>
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
  onCreate: (input: {
    description: string;
    title: string;
  }) => void | Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    await onCreate({ description: description.trim(), title: title.trim() });
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

function ListDialog({
  initialTitle = "",
  isOpen,
  onClose,
  onSave,
  title,
}: {
  initialTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string) => void | Promise<void>;
  title: string;
}) {
  const [value, setValue] = useState(initialTitle);

  if (!isOpen) return null;
  return (
    <DialogShell
      onClose={onClose}
      subtitle="Organize cards into a focused workflow stage."
      title={title}
    >
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          if (value.trim()) await onSave(value.trim());
        }}
      >
        <TextInput
          label="List Name"
          onChange={setValue}
          required
          value={value}
        />
        <DialogActions onClose={onClose} submitLabel="Save List" />
      </form>
    </DialogShell>
  );
}

function CardDialog({
  card,
  isOpen,
  onClose,
  onSave,
}: {
  card?: MockCard;
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, description: string) => void | Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;
  return (
    <DialogShell
      onClose={onClose}
      subtitle="Capture the work, context, and next action for this card."
      title={card ? "Edit Card" : "Create Card"}
    >
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          if (title.trim()) await onSave(title.trim(), description.trim());
        }}
      >
        <TextInput
          label="Card Title"
          onChange={setTitle}
          required
          value={title}
        />
        <TextareaInput
          label="Description"
          onChange={setDescription}
          value={description}
        />
        <DialogActions
          onClose={onClose}
          submitLabel={card ? "Save Card" : "Create Card"}
        />
      </form>
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
