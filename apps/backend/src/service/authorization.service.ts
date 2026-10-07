import { prisma } from "@taskforge/db";
import { AppError } from "../utils/app-error";

export type OrganizationRoleName = "OWNER" | "ADMIN" | "MEMBER";
export type BoardRoleName = "OWNER" | "MEMBER";

export async function assertOrganizationAccess(
  organizationId: string,
  userId: string,
) {
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: { organizationId, userId },
    },
    select: { role: true },
  });

  if (!membership) {
    throw new AppError("You are not a member of this organization", 403);
  }

  return membership.role;
}

export async function assertOrganizationManager(
  organizationId: string,
  userId: string,
) {
  const role = await assertOrganizationAccess(organizationId, userId);

  if (role !== "OWNER" && role !== "ADMIN") {
    throw new AppError(
      "You do not have permission to manage this organization",
      403,
    );
  }

  return role;
}

export async function assertBoardAccess(
  organizationId: string,
  boardId: string,
  userId: string,
) {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      organizationId,
    },
    select: {
      id: true,
      ownerId: true,
      members: {
        where: { userId },
        select: { role: true },
      },
      organization: {
        select: {
          members: {
            where: { userId },
            select: { role: true },
          },
        },
      },
    },
  });

  if (!board) {
    throw new AppError("Board not found", 404);
  }

  const userOwnsBoard = board.ownerId === userId;
  const boardRole = board.members[0]?.role;
  const organizationRole = board.organization.members[0]?.role;
  const hasBoardAccess =
    userOwnsBoard ||
    boardRole === "OWNER" ||
    boardRole === "MEMBER" ||
    organizationRole === "OWNER" ||
    organizationRole === "ADMIN";

  if (!hasBoardAccess) {
    throw new AppError("You do not have access to this board", 403);
  }

  return {
    boardId: board.id,
    boardRole,
    organizationRole,
  };
}

export async function assertBoardManager(
  organizationId: string,
  boardId: string,
  userId: string,
) {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      organizationId,
    },
    include: {
      members: {
        where: { userId },
        select: { role: true },
      },
      organization: {
        include: {
          members: {
            where: { userId },
            select: { role: true },
          },
        },
      },
    },
  });

  if (!board) {
    throw new AppError("Board not found", 404);
  }

  const boardRole = board.members[0]?.role;
  const organizationRole = board.organization.members[0]?.role;
  const hasManagerAccess =
    board.ownerId === userId ||
    boardRole === "OWNER" ||
    organizationRole === "OWNER" ||
    organizationRole === "ADMIN";

  if (!hasManagerAccess) {
    throw new AppError("You do not have permission to manage this board", 403);
  }

  return board;
}
