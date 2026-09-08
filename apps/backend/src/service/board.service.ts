import { prisma } from "@taskforge/db"
type CreateBoardInput = {
  organizationId: string;
  title: string;
  description?: string;
  userId: string;
};
export const createBoard = async (input: CreateBoardInput) => {
    return await prisma.board.create({
        data: {
            title: input.title,
            description: input.description,
            organizationId: input.organizationId,
            ownerId: input.userId
        }
    })
}