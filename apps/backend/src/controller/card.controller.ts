import { Request, Response, NextFunction } from "express";
import { cardService } from "../service/card.service";
import { AppError } from "../utils/app-error";

export const cardController = {
  createCard: async (
    req: Request<{listId:string}>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { listId } = req.params;
      const { title, description } = req.body;

      if (!title || !title.trim()) {
        throw new AppError("Card title is required", 400);
      }

      const card = await cardService.createCard({
        listId,
        title: title.trim(),
        description,
        userId: req.userId!,
      });

      return res.status(201).json(card);
    } catch (error) {
      next(error);
    }
  },
};