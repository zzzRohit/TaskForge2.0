import { prisma } from "@taskforge/db";
import { AppError } from "../utils/app-error";

type CreateListInput = {
  title: string;
  boardId: string;
  position: number;
};
export const createList = async ({
  title,
  position,
  boardId,
}: CreateListInput) => {
  const list = await prisma.list.create({
    data: {
      title,
      position,
      boardId,
    },
  });
  return list;
};
export const getListsByBoardId = async (boardId: string) => {
  const lists = await prisma.list.findMany({
    where: {
      boardId,
    },
    orderBy: {
      position: "asc",
    },
  });
  return lists;
};
export const getListById = async (listId: string) => {
  const list = await prisma.list.findUnique({
    where: {
      id: listId,
    },
  });
  return list;
};
export const updateList = async (
  listId: string,
  data: { title?: string; position?: number },
) => {
  const updatedList = await prisma.list.update({
    where: {
      id: listId,
    },
    data,
  });
  return updatedList;
};
export const deleteList = async (listId: string) => {
  await prisma.list.delete({
    where: {
      id: listId,
    },
  });
};

export const assertBoardAccess = async (
  organizationId: string,
  boardId: string,
  userId: string,
) => {
  const board = await prisma.board.findFirst({
    where: { id: boardId, organizationId },
    select: {
      ownerId: true,
      members: { where: { userId }, select: { userId: true } },
      organization: {
        select: { members: { where: { userId }, select: { role: true } } },
      },
    },
  });
  const role = board?.organization.members[0]?.role;
  if (
    !board ||
    (board.ownerId !== userId &&
      board.members.length === 0 &&
      role !== "OWNER" &&
      role !== "ADMIN")
  ) {
    throw new AppError("You do not have access to this board", 403);
  }
};
