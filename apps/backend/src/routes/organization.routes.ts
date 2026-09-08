import {Router} from 'express';
import * as organizationController from '../controller/organization.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { organizationMiddleware } from '../middleware/organization.middleware';
const router = Router();

router.post("/",authMiddleware, organizationController.createOrganization);
router.get('/' ,authMiddleware, organizationController.getAllOrganizations);
router.get('/:organizationId',authMiddleware, organizationMiddleware, organizationController.getOrganizationById);
export default router;