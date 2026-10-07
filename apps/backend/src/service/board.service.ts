import { prisma } from "@taskforge/db";
import { AppError } from "../utils/app-error";
import { assertBoardManager, assertBoardAccess } from "./authorization.service";

type CreateBoardInput = {
  organizationId: string;
  title: string;
  description?: string;
  userId: string;
};

export const createBoard = async (input: CreateBoardInput) => {
  return await prisma.board.create({
    data: {
      title: input.title,
      description: input.description,
      organizationId: input.organizationId,
      ownerId: input.userId,
      members: {
        create: {
          userId: input.userId,
          role: "OWNER",
        },
      },
    },
  });
};

export const getBoardsByOrganizationId = async (
  organizationId: string,
  userId: string,
) => {
  return await prisma.board.findMany({
    where: {
      organizationId,
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
        {
          organization: {
            members: { some: { userId, role: { in: ["OWNER", "ADMIN"] } } },
          },
        },
      ],
    },
  });
};

export const getBoardById = async (
  organizationId: string,
  boardId: string,
  userId: string,
) => {
  return await prisma.board.findFirst({
    where: {
      id: boardId,
      organizationId,
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
        {
          organization: {
            members: { some: { userId, role: { in: ["OWNER", "ADMIN"] } } },
          },
        },
      ],
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      },
    },
  });
};

export const updateBoard = async (input: {
  organizationId: string;
  boardId: string;
  title?: string;
  description?: string;
  userId: string;
}) => {
  await assertBoardManager(input.organizationId, input.boardId, input.userId);
  const board = await prisma.board.update({
    where: {
      id: input.boardId,
    },
    data: {
      title: input.title,
      description: input.description,
    },
  });
  return board;
};

export const deleteBoard = async (input: {
  organizationId: string;
  boardId: string;
  userId: string;
}) => {
  await assertBoardManager(input.organizationId, input.boardId, input.userId);
  const board = await prisma.board.delete({
    where: {
      id: input.boardId,
    },
  });
  return board;
};

export const getMembers = async (
  organizationId: string,
  boardId: string,
  userId: string,
) => {
  await assertBoardAccess(organizationId, boardId, userId);

  const board = await getBoardById(organizationId, boardId, userId);
  if (!board) return null;

  const members = board.members.map((member) => ({
    id: member.user.id,
    name: member.user.name,
    email: member.user.email,
    avatarUrl: member.user.avatarUrl,
    role: member.role,
    createdAt: member.createdAt,
  }));

  if (!members.some((member) => member.id === board.owner.id)) {
    members.unshift({
      id: board.owner.id,
      name: board.owner.name,
      email: board.owner.email,
      avatarUrl: board.owner.avatarUrl,
      role: "OWNER",
      createdAt: board.createdAt,
    });
  }

  return members;
};

export const addMember = async ({
  actorUserId,
  organizationId,
  boardId,
  userId,
}: {
  actorUserId: string;
  organizationId: string;
  boardId: string;
  userId: string;
}) => {
  await assertBoardManager(organizationId, boardId, actorUserId);
  const organizationMember = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
  });
  if (!organizationMember)
    throw new AppError("User must belong to the organization", 400);

  return prisma.boardMember.upsert({
    where: { boardId_userId: { boardId, userId } },
    create: { boardId, userId, role: "MEMBER" },
    update: {},
  });
};

export const removeMember = async ({
  actorUserId,
  organizationId,
  boardId,
  userId,
}: {
  actorUserId: string;
  organizationId: string;
  boardId: string;
  userId: string;
}) => {
  const board = await assertBoardManager(organizationId, boardId, actorUserId);
  if (board.ownerId === userId)
    throw new AppError("The board owner cannot be removed", 403);
  await prisma.boardMember.delete({
    where: { boardId_userId: { boardId, userId } },
  });
};
