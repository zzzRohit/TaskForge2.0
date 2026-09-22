import { prisma } from "@taskforge/db";
import { AppError } from "../utils/app-error";

interface CreateCardInput {
  listId: string;
  title: string;
  description?: string;
  userId: string;
}
interface getCardsInput {
  listId: string;
  userId: string;
}
interface getCardInput {
  cardId: string;
  userId: string;
}
interface UpdateCardInput {
  cardId: string;
  userId: string;
  title?: string;
  description?: string | null;
}
interface moveCardInput {
  cardId: string;
  targetListId: string;
  position: number;
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
  getcards: async ({ listId, userId }: getCardsInput) => {
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

    await assertOrganizationMember(list.board.organizationId, userId);

    const cards = await prisma.card.findMany({
      where: {
        listId,
      },
      orderBy: {
        position: "asc",
      },
    });
    return cards;
  },
  getcardById: async ({ cardId, userId }: getCardInput) => {
    const card = await prisma.card.findUnique({
      where: {
        id: cardId,
      },
      include: {
        list: {
          include: {
            board: {
              select: {
                organizationId: true,
              },
            },
          },
        },
      },
    });

    if (!card) {
      throw new AppError("Card not found", 404);
    }

    await assertOrganizationMember(card.list.board.organizationId, userId);

    const { list, ...cardData } = card;
    return cardData;
  },
  updateCard: async ({
    cardId,
    userId,
    title,
    description,
  }: UpdateCardInput) => {
    const card = await cardService.getcardById({ cardId, userId });

    return prisma.card.update({
      where: {
        id: card.id,
      },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
      },
    });
  },
  deleteCard: async ({ cardId, userId }: getCardInput) => {
    const card = await cardService.getcardById({ cardId, userId });

    await prisma.card.delete({
      where: {
        id: card.id,
      },
    });
  },
  moveCard: async ({
    cardId,
    targetListId,
    position,
    userId,
  }: moveCardInput) => {
    // 1. Find the card + its current organization
    const card = await prisma.card.findUnique({
      where: {
        id: cardId,
      },
      include: {
        list: {
          include: {
            board: {
              select: {
                organizationId: true,
              },
            },
          },
        },
      },
    });

    if (!card) {
      throw new AppError("Card not found", 404);
    }

    // 2. Find the target list + its organization
    const targetList = await prisma.list.findUnique({
      where: {
        id: targetListId,
      },
      include: {
        board: {
          select: {
            organizationId: true,
          },
        },
      },
    });

    if (!targetList) {
      throw new AppError("Target list not found", 404);
    }

    // 3. Check organization membership
    await assertOrganizationMember(card.list.board.organizationId, userId);

    // 4. Make sure target list belongs to same organization
    if (targetList.board.organizationId !== card.list.board.organizationId) {
      throw new AppError("Invalid target list", 400);
    }

    // 5. Don't allow negative positions
    if (position < 0) {
      throw new AppError("Position cannot be negative", 400);
    }

    // 6. Same-list reorder
    if (card.listId === targetListId) {
      return prisma.$transaction(async (tx) => {
        const oldPosition = card.position;

        // Moving UP
        if (oldPosition > position) {
          await tx.card.updateMany({
            where: {
              listId: card.listId,
              position: {
                gte: position,
                lt: oldPosition,
              },
            },
            data: {
              position: {
                increment: 1,
              },
            },
          });
        }

        // Moving DOWN
        if (oldPosition < position) {
          await tx.card.updateMany({
            where: {
              listId: card.listId,
              position: {
                gt: oldPosition,
                lte: position,
              },
            },
            data: {
              position: {
                decrement: 1,
              },
            },
          });
        }

        // Move the actual card
        return tx.card.update({
          where: {
            id: cardId,
          },
          data: {
            position,
          },
        });
      });
    }

    // 7. Cross-list move
    return prisma.$transaction(async (tx) => {
      // Close the gap in the old list
      await tx.card.updateMany({
        where: {
          listId: card.listId,
          position: {
            gt: card.position,
          },
        },
        data: {
          position: {
            decrement: 1,
          },
        },
      });

      // Make space in the target list
      await tx.card.updateMany({
        where: {
          listId: targetListId,
          position: {
            gte: position,
          },
        },
        data: {
          position: {
            increment: 1,
          },
        },
      });

      // Move the card
      return tx.card.update({
        where: {
          id: cardId,
        },
        data: {
          listId: targetListId,
          position,
        },
      });
    });
  },
};

async function assertOrganizationMember(
  organizationId: string,
  userId: string,
) {
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  });

  if (!membership) {
    throw new AppError("You do not have access to this card", 403);
  }
}
