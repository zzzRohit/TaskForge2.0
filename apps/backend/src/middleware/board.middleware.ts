import { OrganizationRole, prisma } from "@taskforge/db";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error";

export const boardMiddleware = async (
  req: Request<{ organizationId: string }>,
  res: Response,
  next: NextFunction,
) => {
  const { organizationId } = req.params;
  const userId = req.userId;
  if (!userId) {
    return next(new AppError("Unauthorized", 401));
  }
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: organizationId,
        userId: userId,
      },
    },
  });
  if (
    !membership ||
    (membership.role !== OrganizationRole.OWNER &&
      membership.role !== OrganizationRole.ADMIN)
  ) {
    return next(
      new AppError("You do not have permission to manage this board", 403),
    );
  }
  next();
};
