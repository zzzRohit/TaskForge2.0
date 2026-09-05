import {Request, Response} from "express";
import * as organizationService from "../service/organization.service";
export const createOrganization = async (request: Request, response: Response) => {
  // Implementation for creating an organization
  // Example implementation (replace with actual logic):
  const {name} = request.body;
    if (!name) {
      return response.status(400).json({ error: "Organization name is required" });
    }
    const createdOrganization = await organizationService.createOrganization(name);
    return response.status(201).json(createdOrganization);

};
export const getAllOrganizations = async (request: Request, response: Response) => {
  const organizations = await organizationService.getAllOrganizations();
  return response.status(200).json(organizations);
}