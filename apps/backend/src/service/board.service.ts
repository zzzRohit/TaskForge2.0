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
export const updateBoard = async (input: { organizationId: string, boardId: string, title?: string, description?: string, userId: string }) => {
    const board = await prisma.board.update({
        where: {
            id: input.boardId
        },
        data: {
            title: input.title,
            description: input.description
        }
    })
    return board;
}
export const deleteBoard = async (input: { organizationId: string, boardId: string, userId: string }) => {
    const board = await prisma.board.delete({
        where: {
            id: input.boardId
        }
    })
    return board;
}   