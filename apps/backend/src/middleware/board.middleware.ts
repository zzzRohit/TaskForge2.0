import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error";
import { assertBoardManager } from "../service/authorization.service";

export const boardMiddleware = async (
  req: Request<{ organizationId: string; boardId: string }>,
  res: Response,
  next: NextFunction,
) => {
  const { organizationId, boardId } = req.params;
  const userId = req.userId;

  if (!userId) {
    return next(new AppError("Unauthorized", 401));
  }

  try {
    await assertBoardManager(organizationId, boardId, userId);
    next();
  } catch (error) {
    next(error);
  }
};
