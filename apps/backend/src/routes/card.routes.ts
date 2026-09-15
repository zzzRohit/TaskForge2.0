import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { cardController } from "../controller/card.controller";
const router = Router();
router.post("/lists/:listId/cards", authMiddleware, cardController.createCard);
