import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error";
import { assertOrganizationAccess } from "../service/authorization.service";

export const organizationMiddleware = async (
  req: Request<{ organizationId: string }>,
  res: Response,
  next: NextFunction,
) => {
  const { organizationId } = req.params;
  const userId = req.userId;

  if (!userId) {
    return next(new AppError("Unauthorized", 401));
  }

  if (!organizationId) {
    return next(new AppError("Organization ID is required", 400));
  }

  try {
    await assertOrganizationAccess(organizationId, userId);
    next();
  } catch (error) {
    next(error);
  }
};
