import { Request, Response, NextFunction } from "express";
import { cardService } from "../service/card.service";
import { AppError } from "../utils/app-error";

export const cardController = {
  createCard: async (
    req: Request<{ listId: string }>,
    res: Response,
    next: NextFunction,
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
  getcard: async (
    req: Request<{ listId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { listId } = req.params;
      const cards = await cardService.getcards({
        listId,
        userId: req.userId!,
      });

      return res.status(200).json(cards);
    } catch (error) {
      next(error);
    }
  },
  getCardById: async (
    req: Request<{ cardId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const card = await cardService.getcardById({
        cardId: req.params.cardId,
        userId: req.userId!,
      });

      return res.status(200).json(card);
    } catch (error) {
      next(error);
    }
  },
  updateCard: async (
    req: Request<{ cardId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { title, description } = req.body;

      if (title !== undefined && (!title || !title.trim())) {
        throw new AppError("Card title is required", 400);
      }

      const card = await cardService.updateCard({
        cardId: req.params.cardId,
        userId: req.userId!,
        title: title?.trim(),
        description,
      });

      return res.status(200).json(card);
    } catch (error) {
      next(error);
    }
  },
  deleteCard: async (
    req: Request<{ cardId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await cardService.deleteCard({
        cardId: req.params.cardId,
        userId: req.userId!,
      });

      return res.status(200).json({ message: "Card deleted successfully" });
    } catch (error) {
      next(error);
    }
  },
};
