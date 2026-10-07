import { Request, Response, NextFunction } from "express";
import { cardService } from "../service/card.service";
import { AppError } from "../utils/app-error";
import { getIO } from "../lib/socket";
export const cardController = {
  createCard: async (
    req: Request<{ listId: string; boardId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { listId, boardId } = req.params;
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
      const io = getIO();
      io.to(boardId).emit("card-created", card);
      console.log("EMITTING CARD CREATED:");

      return res.status(201).json(card);
    } catch (error) {
      next(error);
    }
  },
  getcard: async (
    req: Request<{ boardId: string; listId: string }>,
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
    req: Request<{ boardId: string; cardId: string }>,
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
    req: Request<{ boardId: string; cardId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const {boardId} = req.params;
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
      const io = getIO();
      io.to(boardId).emit("card-updated", card);
      return res.status(200).json(card);
    } catch (error) {
      next(error);
    }
  },
  deleteCard: async (
    req: Request<{ boardId: string; cardId: string }>,
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
  moveCard: async (
    req: Request<{ boardId: string; cardId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { cardId } = req.params;
      const { targetListId, position } = req.body;
      const userId = req.userId!;

      const card = await cardService.moveCard({
        cardId,
        targetListId,
        position,
        userId,
      });

      return res.status(200).json(card);
    } catch (error) {
      next(error);
    }
  },
};
