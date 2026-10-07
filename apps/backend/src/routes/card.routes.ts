import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { cardController } from "../controller/card.controller";
const router = Router();
router.post(
  "/boards/:boardId/lists/:listId/cards",
  authMiddleware,
  cardController.createCard,
);
router.get(
  "/boards/:boardId/lists/:listId/cards",
  authMiddleware,
  cardController.getcard,
);
router.get(
  "/boards/:boardId/cards/:cardId",
  authMiddleware,
  cardController.getCardById,
);
router.patch(
  "/boards/:boardId/cards/:cardId",
  authMiddleware,
  cardController.updateCard,
);
router.delete(
  "/boards/:boardId/cards/:cardId",
  authMiddleware,
  cardController.deleteCard,
);
router.patch(
  "/boards/:boardId/cards/:cardId/move",
  authMiddleware,
  cardController.moveCard,
);
export default router;
