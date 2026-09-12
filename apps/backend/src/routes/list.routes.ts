import {Router} from "express"
import { authMiddleware } from "../middleware/auth.middleware";
import { organizationMiddleware } from "../middleware/organization.middleware";
import * as listController from "../controller/list.controller";
const router = Router();
router.post(":organizationId/boards/:boardId/lists", authMiddleware, organizationMiddleware ,listController.createList);
export default router;