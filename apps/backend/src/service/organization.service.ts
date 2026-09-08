import { prisma } from "@taskforge/db";
export const createOrganization = async (name: string, userId: string) => {
  // Implementation for creating an organization
  // Example implementation (replace with actual logic):
  if (!name) {
    throw new Error("Organization name is required");
  }
  // Simulate organization creation
  const createdOrganization = await prisma.organization.create({
    data: { 
      name,
      members: {
        create: {
          userId: userId,
          role: "OWNER", // Assuming the creator is the owner of the organization
        },
      },
     },
  });
  return createdOrganization;
};
export const getAllOrganizations = async (userId: string) => {
  return prisma.organization.findMany({
    where: {
      members: {
        some: {
          userId: userId
        }
      }
    }
  });
};

export const getOrganizationById = async (organizationId: string) => {
  return prisma.organization.findFirst({
    where: {
      id: organizationId
    }
  });
};