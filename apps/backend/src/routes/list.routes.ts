import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { organizationMiddleware } from "../middleware/organization.middleware";
import { boardMiddleware } from "../middleware/board.middleware";
import * as listController from "../controller/list.controller";
const router = Router();
router.post(
  "/:organizationId/board/:boardId/list",
  authMiddleware,
  organizationMiddleware,
  boardMiddleware,
  listController.createList,
);
router.get(
  "/:organizationId/board/:boardId/list",
  authMiddleware,
  organizationMiddleware,
  listController.getListsByBoardId);
router.get(
  "/:organizationId/board/:boardId/list/:listId",
  authMiddleware,
  organizationMiddleware,
  listController.getlist);
router.patch(
  "/:organizationId/board/:boardId/list/:listId",
  authMiddleware,
  organizationMiddleware,
  boardMiddleware,
  listController.updateList
);
router.delete(
  "/:organizationId/board/:boardId/list/:listId",
  authMiddleware,
  organizationMiddleware,
  boardMiddleware,
  listController.deleteList)




export default router;
