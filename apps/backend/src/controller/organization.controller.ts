import {Request, Response} from "express";
import * as organizationService from "../service/organization.service";
export const createOrganization = async (request: Request, response: Response) => {
  // Implementation for creating an organization
  // Example implementation (replace with actual logic):
  const {name} = request.body;
    if (!name) {
      return response.status(400).json({ error: "Organization name is required" });
    }
    const userId = request.userId; // Assuming userId is set in the auth middleware
    if(!userId) {
      return response.status(401).json({ error: "Unauthorized" });
    }
    const createdOrganization = await organizationService.createOrganization(name, userId);
    return response.status(201).json(createdOrganization);

};
export const getAllOrganizations = async (request: Request, response: Response) => {
  const userId = request.userId; // Assuming userId is set in the auth middleware
  if(!userId) {
    return response.status(401).json({ error: "Unauthorized" });
  }
  const organizations = await organizationService.getAllOrganizations(userId);
  return response.status(200).json(organizations);
}