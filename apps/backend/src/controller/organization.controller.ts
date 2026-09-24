import { Request, Response } from "express";
import * as organizationService from "../service/organization.service";
export const createOrganization = async (
  request: Request,
  response: Response,
) => {
  // Implementation for creating an organization
  // Example implementation (replace with actual logic):
  const { name } = request.body;
  if (!name) {
    return response
      .status(400)
      .json({ error: "Organization name is required" });
  }
  const userId = request.userId; // Assuming userId is set in the auth middleware
  if (!userId) {
    return response.status(401).json({ error: "Unauthorized" });
  }
  const createdOrganization = await organizationService.createOrganization(
    name,
    userId,
  );
  return response.status(201).json(createdOrganization);
};
export const getAllOrganizations = async (
  request: Request,
  response: Response,
) => {
  const userId = request.userId; // Assuming userId is set in the auth middleware
  if (!userId) {
    return response.status(401).json({ error: "Unauthorized" });
  }
  const organizations = await organizationService.getAllOrganizations(userId);
  return response.status(200).json(organizations);
};

export const getOrganizationById = async (
  request: Request<{ organizationId: string }>,
  response: Response,
) => {
  const { organizationId } = request.params;

  const organization =
    await organizationService.getOrganizationById(organizationId);

  if (!organization) {
    return response.status(404).json({
      error: "Organization not found",
    });
  }

  return response.status(200).json(organization);
};

export const getMembers = async (
  request: Request<{ organizationId: string }>,
  response: Response,
) => {
  const members = await organizationService.getMembers(
    request.params.organizationId,
  );
  return response.status(200).json(members);
};

export const updateMemberRole = async (
  request: Request<{ organizationId: string; userId: string }>,
  response: Response,
) => {
  const { role } = request.body;
  if (role !== "ADMIN" && role !== "MEMBER") {
    return response.status(400).json({ error: "Role must be ADMIN or MEMBER" });
  }

  const membership = await organizationService.updateMemberRole({
    actorUserId: request.userId!,
    organizationId: request.params.organizationId,
    role,
    userId: request.params.userId,
  });
  return response.status(200).json(membership);
};

export const removeMember = async (
  request: Request<{ organizationId: string; userId: string }>,
  response: Response,
) => {
  await organizationService.removeMember({
    actorUserId: request.userId!,
    organizationId: request.params.organizationId,
    userId: request.params.userId,
  });
  return response.status(204).send();
};

export const addMember = async (
  request: Request<{ organizationId: string }>,
  response: Response,
) => {
  const { email } = request.body;
  if (!email || typeof email !== "string") {
    return response.status(400).json({ error: "Email is required" });
  }
  const membership = await organizationService.addMember({
    actorUserId: request.userId!,
    organizationId: request.params.organizationId,
    email,
  });
  return response.status(201).json(membership);
};
