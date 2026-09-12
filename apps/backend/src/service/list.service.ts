import { prisma } from "@taskforge/db";

type CreateListInput = {
    title: string;
    boardId: string;
    position: number;
};
export const createList = async ({title, position,boardId }: CreateListInput) => {
    const list = await prisma.list.create({
        data: {
            title,
            position,
            boardId,
        }
    });
    return list;
}   