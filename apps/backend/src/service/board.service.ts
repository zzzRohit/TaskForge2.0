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
export const getBoardsByOrganizationId = async (organizationId: string) => {
    return await prisma.board.findMany({
        where: {
            organizationId: organizationId
        }
    })
}
export const getBoardById = async (organizationId: string, boardId: string) => {
    return await prisma.board.findFirst({
        where: {
            id : boardId,
            organizationId: organizationId
            }
    })
}