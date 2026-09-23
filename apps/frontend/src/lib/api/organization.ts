import { api } from "./client";
import type { ApiOrganization } from "../../types/taskforge";

export async function getOrganizations(): Promise<ApiOrganization[]> {
  const response = await api.get<ApiOrganization[]>("/organization");
  return response.data;
}

export async function createOrganization(
  name: string,
): Promise<ApiOrganization> {
  const response = await api.post<ApiOrganization>("/organization", { name });
  return response.data;
}
