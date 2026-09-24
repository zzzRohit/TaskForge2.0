import { prisma } from "@taskforge/db";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error";

export const boardMiddleware = async (
  req: Request<{ organizationId: string; boardId: string }>,
  res: Response,
  next: NextFunction,
) => {
  const { organizationId } = req.params;
  const userId = req.userId;
  if (!userId) {
    return next(new AppError("Unauthorized", 401));
  }
  const board = await prisma.board.findFirst({
    where: { id: req.params.boardId, organizationId },
    include: {
      organization: {
        include: { members: { where: { userId }, select: { role: true } } },
      },
    },
  });
  const organizationRole = board?.organization.members[0]?.role;
  if (
    !board ||
    (board.ownerId !== userId &&
      organizationRole !== "OWNER" &&
      organizationRole !== "ADMIN")
  ) {
    return next(
      new AppError("You do not have permission to manage this board", 403),
    );
  }
  next();
};
