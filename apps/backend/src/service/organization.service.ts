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
        orderBy: { createdAt: "asc" },
        select: {
          userId: true,
          role: true,
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  return organizations.map((organization) => ({
    id: organization.id,
    name: organization.name,
    createdAt: organization.createdAt,
    updatedAt: organization.updatedAt,
    role:
      organization.members.find((member) => member.userId === userId)?.role ??
      "MEMBER",
    members: organization._count.members,
    boards: organization._count.boards,
    memberAvatars: [...organization.members]
      .sort((firstMember, secondMember) => {
        if (firstMember.userId === userId) return -1;
        if (secondMember.userId === userId) return 1;
        return 0;
      })
      .slice(0, 3)
      .map((member) => ({
        id: member.user.id,
        name: member.user.name,
        avatarUrl: member.user.avatarUrl,
      })),
  }));
};

export const getOrganizationById = async (organizationId: string) => {
  return prisma.organization.findFirst({
    where: {
      id: organizationId,
    },
  });
};
