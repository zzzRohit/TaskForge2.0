import { Router } from "express";
import * as organizationController from "../controller/organization.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { organizationMiddleware } from "../middleware/organization.middleware";
const router = Router();

router.post("/", authMiddleware, organizationController.createOrganization);
router.get("/", authMiddleware, organizationController.getAllOrganizations);
router.get(
  "/:organizationId",
  authMiddleware,
  organizationMiddleware,
  organizationController.getOrganizationById,
);
router.get(
  "/:organizationId/members",
  authMiddleware,
  organizationMiddleware,
  organizationController.getMembers,
);
router.post(
  "/:organizationId/members",
  authMiddleware,
  organizationMiddleware,
  organizationController.addMember,
);
router.patch(
  "/:organizationId/members/:userId",
  authMiddleware,
  organizationMiddleware,
  organizationController.updateMemberRole,
);
router.delete(
  "/:organizationId/members/:userId",
  authMiddleware,
  organizationMiddleware,
  organizationController.removeMember,
);
export default router;
