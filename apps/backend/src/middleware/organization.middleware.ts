import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export const organizationMiddleware = async (
  req: Request<{ organizationId: string }>,
  res: Response,
  next: NextFunction,
) => {
  const { organizationId } = req.params;
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  if (!organizationId) {
    return res.status(400).json({
      message: "Organization ID is required",
    });
  }
  const isUserInOrganization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
      members: {
        some: {
          userId,
        },
      },
    },
  });
  console.log("isUserInOrganization", isUserInOrganization);
  if (!isUserInOrganization) {
    return res.status(403).json({
      message: "You are not a member of this organization",
    });
  }
  next();
};
