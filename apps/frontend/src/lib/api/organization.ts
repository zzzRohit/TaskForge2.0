import { api } from "./client";
import type { Organization } from "../../types/taskforge";

export async function getOrganizations(): Promise<Organization[]> {
  const response = await api.get<Organization[]>("/organization");
  return response.data;
}

export async function createOrganization(
  name: string,
): Promise<Organization> {
  const response = await api.post<Organization>("/organization", { name });
  return response.data;
}