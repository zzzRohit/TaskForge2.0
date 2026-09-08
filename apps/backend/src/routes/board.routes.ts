import {Router} from 'express';
import * as boardController from '../controller/board.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { organizationMiddleware } from '../middleware/organization.middleware';

const router = Router();
router.post("/:organizationId/boards", authMiddleware, organizationMiddleware, boardController.createBoard);
export default router;