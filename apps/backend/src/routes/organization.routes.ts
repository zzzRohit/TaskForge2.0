import {Router} from 'express';
import * as organizationController from '../controller/organization.controller';
const router = Router();

router.post("/", organizationController.createOrganization);
router.get('/' , organizationController.getAllOrganizations);
export default router;