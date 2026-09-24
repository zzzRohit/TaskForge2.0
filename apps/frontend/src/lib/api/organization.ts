import { api } from "./client";
import type { ApiOrganization } from "../../types/taskforge";

export type OrganizationMember = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: "OWNER" | "ADMIN" | "MEMBER";
  createdAt: string;
};

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

export async function getOrganizationMembers(
  organizationId: string,
): Promise<OrganizationMember[]> {
  const response = await api.get<OrganizationMember[]>(
    `/organization/${organizationId}/members`,
  );
  return response.data;
}

export async function updateOrganizationMemberRole(
  organizationId: string,
  userId: string,
  role: "ADMIN" | "MEMBER",
): Promise<void> {
  await api.patch(`/organization/${organizationId}/members/${userId}`, {
    role,
  });
}

export async function addOrganizationMember(
  organizationId: string,
  email: string,
): Promise<void> {
  await api.post(`/organization/${organizationId}/members`, { email });
}

export async function removeOrganizationMember(
  organizationId: string,
  userId: string,
): Promise<void> {
  await api.delete(`/organization/${organizationId}/members/${userId}`);
}
