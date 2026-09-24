import { OrganizationRole, prisma } from "@taskforge/db";
import { AppError } from "../utils/app-error";
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

export const getMembers = async (organizationId: string) => {
  const members = await prisma.organizationMember.findMany({
    where: { organizationId },
    orderBy: { createdAt: "asc" },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  });

  return members.map((member) => ({
    id: member.user.id,
    name: member.user.name,
    email: member.user.email,
    avatarUrl: member.user.avatarUrl,
    role: member.role,
    createdAt: member.createdAt,
  }));
};

export const updateMemberRole = async ({
  actorUserId,
  organizationId,
  role,
  userId,
}: {
  actorUserId: string;
  organizationId: string;
  role: "ADMIN" | "MEMBER";
  userId: string;
}) => {
  const actor = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId: actorUserId } },
  });
  const target = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
  });

  if (!actor || actor.role !== OrganizationRole.OWNER) {
    throw new AppError(
      "Only the organization owner can change member roles",
      403,
    );
  }
  if (!target) throw new AppError("Organization member not found", 404);
  if (target.role === OrganizationRole.OWNER) {
    throw new AppError("The organization owner role cannot be changed", 403);
  }

  return prisma.organizationMember.update({
    where: { organizationId_userId: { organizationId, userId } },
    data: { role },
  });
};

export const addMember = async ({
  actorUserId,
  organizationId,
  email,
}: {
  actorUserId: string;
  organizationId: string;
  email: string;
}) => {
  const actor = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId: actorUserId } },
  });
  if (
    !actor ||
    (actor.role !== OrganizationRole.OWNER &&
      actor.role !== OrganizationRole.ADMIN)
  ) {
    throw new AppError("You do not have permission to manage members", 403);
  }

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!user) throw new AppError("No user exists with that email", 404);

  return prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId, userId: user.id } },
    create: { organizationId, userId: user.id, role: "MEMBER" },
    update: {},
  });
};

export const removeMember = async ({
  actorUserId,
  organizationId,
  userId,
}: {
  actorUserId: string;
  organizationId: string;
  userId: string;
}) => {
  const actor = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId: actorUserId } },
  });
  const target = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
  });

  if (
    !actor ||
    (actor.role !== OrganizationRole.OWNER &&
      actor.role !== OrganizationRole.ADMIN)
  ) {
    throw new AppError("You do not have permission to manage members", 403);
  }
  if (!target) throw new AppError("Organization member not found", 404);
  if (target.role === OrganizationRole.OWNER) {
    throw new AppError("The organization owner cannot be removed", 403);
  }
  if (
    actor.role === OrganizationRole.ADMIN &&
    target.role === OrganizationRole.ADMIN
  ) {
    throw new AppError("Admins cannot remove other admins", 403);
  }

  await prisma.organizationMember.delete({
    where: { organizationId_userId: { organizationId, userId } },
  });
};
