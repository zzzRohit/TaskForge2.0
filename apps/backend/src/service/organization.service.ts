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
  const organizations = await getAllOrganizations(userId);
  return organizations.find(
    (organization) => organization.id === createdOrganization.id,
  );
};
export const getAllOrganizations = async (userId: string) => {
  const organizations = await prisma.organization.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      _count: {
        select: {
          members: true,
          boards: true,
        },
      },
      members: {
        where: { userId },
        select: { role: true },
      },
    },
  });

  return organizations.map((organization) => ({
    id: organization.id,
    name: organization.name,
    createdAt: organization.createdAt,
    updatedAt: organization.updatedAt,
    role: organization.members[0]?.role ?? "MEMBER",
    members: organization._count.members,
    boards: organization._count.boards,
  }));
};

export const getOrganizationById = async (organizationId: string) => {
  return prisma.organization.findFirst({
    where: {
      id: organizationId,
    },
  });
};
