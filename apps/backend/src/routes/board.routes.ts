import {Router} from 'express';
import * as boardController from '../controller/board.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { organizationMiddleware } from '../middleware/organization.middleware';

const router = Router();
//create board
router.post("/:organizationId/board", authMiddleware, organizationMiddleware, boardController.createBoard);
// get boards by organization id
router.get("/:organizationId/boards", authMiddleware, organizationMiddleware, boardController.getBoardsByOrganizationId);
// get single board by id
router.get("/:organizationId/board/:boardId", authMiddleware, organizationMiddleware, boardController.getBoardById);

router.patch("/:organizationId/board/:boardId", authMiddleware, organizationMiddleware, boardController.updateBoard);
export default router;