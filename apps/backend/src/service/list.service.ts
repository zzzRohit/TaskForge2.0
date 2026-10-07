import { prisma } from "@taskforge/db";
import { getIO } from "../lib/socket";
import { assertBoardAccess as assertBoardAccessForResource } from "./authorization.service";

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
  const io = getIO();
  io.to(boardId).emit("list-created", list);
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
  await assertBoardAccessForResource(organizationId, boardId, userId);
};
