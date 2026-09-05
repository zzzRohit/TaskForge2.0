import { prisma } from "@taskforge/db";
export const createOrganization = async (name: string) => {
  // Implementation for creating an organization
  // Example implementation (replace with actual logic):
  if (!name) {
    throw new Error("Organization name is required");
  }
  // Simulate organization creation
  const createdOrganization = await prisma.organization.create({
    data: { name },
  });
  return createdOrganization;
};
export const getAllOrganizations = async () => {
  return prisma.organization.findMany();
}

