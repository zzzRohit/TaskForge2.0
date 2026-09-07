import {Router} from 'express';
import * as organizationController from '../controller/organization.controller';
import { authMiddleware } from '../middleware/auth.middleware';
const router = Router();

router.post("/",authMiddleware, organizationController.createOrganization);
router.get('/' ,authMiddleware, organizationController.getAllOrganizations);
export default router;