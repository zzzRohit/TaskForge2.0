import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { BoardRole, OrganizationRole, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const testUsers = [
  {
    key: "user1",
    name: "TaskForge Owner",
    email: "owner@taskforge.test",
    password: "OwnerPass123!",
  },
  {
    key: "user2",
    name: "TaskForge Admin",
    email: "admin@taskforge.test",
    password: "AdminPass123!",
  },
  {
    key: "user3",
    name: "TaskForge Member",
    email: "member@taskforge.test",
    password: "MemberPass123!",
  },
  {
    key: "user4",
    name: "TaskForge Second Admin",
    email: "admin2@taskforge.test",
    password: "Admin2Pass123!",
  },
  {
    key: "user5",
    name: "TaskForge Second Member",
    email: "member2@taskforge.test",
    password: "Member2Pass123!",
  },
] as const;

const organizations = [
  {
    key: "organization1",
    name: "TaskForge Alpha",
    memberships: [
      ["user1", OrganizationRole.OWNER],
      ["user2", OrganizationRole.ADMIN],
      ["user3", OrganizationRole.MEMBER],
    ] as const,
    boards: [
      ["Alpha Roadmap", "user1"],
      ["Alpha Operations", "user2"],
      ["Alpha Archive", "user1"],
    ] as const,
  },
  {
    key: "organization2",
    name: "TaskForge Beta",
    memberships: [
      ["user1", OrganizationRole.OWNER],
      ["user4", OrganizationRole.ADMIN],
      ["user5", OrganizationRole.MEMBER],
    ] as const,
    boards: [
      ["Beta Roadmap", "user1"],
      ["Beta Operations", "user4"],
    ] as const,
  },
  {
    key: "organization3",
    name: "TaskForge Gamma",
    memberships: [
      ["user2", OrganizationRole.OWNER],
      ["user3", OrganizationRole.MEMBER],
    ] as const,
    boards: [
      ["Gamma Roadmap", "user2"],
      ["Gamma Collaboration", "user2"],
    ] as const,
  },
] as const;

type SeedUser = { id: string; email: string };

async function upsertUser(user: (typeof testUsers)[number]): Promise<SeedUser> {
  const passwordHash = await bcrypt.hash(user.password, 10);
  return prisma.user.upsert({
    where: { email: user.email },
    update: {
      name: user.name,
      passwordHash,
    },
    create: {
      name: user.name,
      email: user.email,
      passwordHash,
    },
    select: { id: true, email: true },
  });
}

async function main() {
  const usersByKey = new Map<string, SeedUser>();
  for (const user of testUsers) {
    usersByKey.set(user.key, await upsertUser(user));
  }

  for (const organization of organizations) {
    const existingOrganization = await prisma.organization.findFirst({
      where: { name: organization.name },
      select: { id: true },
    });
    const savedOrganization =
      existingOrganization ??
      (await prisma.organization.create({
        data: { name: organization.name },
        select: { id: true },
      }));

    for (const [userKey, role] of organization.memberships) {
      const user = usersByKey.get(userKey);
      if (!user) {
        throw new Error(`Missing seeded user: ${userKey}`);
      }

      await prisma.organizationMember.upsert({
        where: {
          organizationId_userId: {
            organizationId: savedOrganization.id,
            userId: user.id,
          },
        },
        update: { role },
        create: {
          organizationId: savedOrganization.id,
          userId: user.id,
          role,
        },
      });
    }

    for (const [title, ownerKey] of organization.boards) {
      const owner = usersByKey.get(ownerKey);
      if (!owner) {
        throw new Error(`Missing board owner: ${ownerKey}`);
      }

      const existingBoard = await prisma.board.findFirst({
        where: {
          organizationId: savedOrganization.id,
          title,
        },
        select: { id: true },
      });

      const board = existingBoard
        ? await prisma.board.update({
            where: { id: existingBoard.id },
            data: { ownerId: owner.id },
            select: { id: true },
          })
        : await prisma.board.create({
            data: {
              title,
              description: `${title} test board`,
              organizationId: savedOrganization.id,
              ownerId: owner.id,
            },
            select: { id: true },
          });

      await prisma.boardMember.upsert({
        where: {
          boardId_userId: {
            boardId: board.id,
            userId: owner.id,
          },
        },
        update: { role: BoardRole.OWNER },
        create: {
          boardId: board.id,
          userId: owner.id,
          role: BoardRole.OWNER,
        },
      });
    }
  }

  console.log("TaskForge authorization test data is ready.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
