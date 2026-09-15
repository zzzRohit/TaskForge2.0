import { prisma } from "@taskforge/db";
import { AppError } from "../utils/app-error";

interface CreateCardInput {
  listId: string;
  title: string;
  description?: string;
  userId: string;
}

export const cardService = {
  createCard: async ({
    listId,
    title,
    description,
    userId,
  }: CreateCardInput) => {
    // 1. Find list + board + organization
    const list = await prisma.list.findUnique({
      where: {
        id: listId,
      },
      include: {
        board: {
          select: {
            organizationId: true,
          },
        },
      },
    });

    if (!list) {
      throw new AppError("List not found", 404);
    }

    // 2. Check user's organization membership
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: list.board.organizationId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new AppError("You do not have access to this list", 403);
    }

    // 3. Get the last card position
    const lastCard = await prisma.card.findFirst({
      where: {
        listId,
      },
      orderBy: {
        position: "desc",
      },
    });

    const position = lastCard ? lastCard.position + 1 : 0;

    // 4. Create card
    return prisma.card.create({
      data: {
        title,
        description,
        listId,
        position,
      },
    });
  },
};
