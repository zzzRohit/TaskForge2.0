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
      throw new AppError("card not found", 404);
    }
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
      throw new AppError("Target list not found ", 404);
    }
    await assertOrganizationMember(card.list.board.organizationId, userId);
    if (targetList.board.organizationId !== card.list.board.organizationId) {
      throw new AppError("Invalid target list", 400);
    }

    return prisma.card.update({
      where: {
        id: cardId,
      },
      data: {
        listId: targetListId,
        position,
      },
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
