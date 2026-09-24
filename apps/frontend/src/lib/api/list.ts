import { api } from "./client";
import type { BoardCard, BoardList } from "../../types/taskforge";

export type ListInput = {
  title: string;
  position: number;
};

type ListResponse = {
  status: string;
  data: BoardList[];
};

export async function getLists(
  organizationId: string,
  boardId: string,
): Promise<Array<BoardList & { cards: BoardCard[] }>> {
  const response = await api.get<ListResponse>(
    `/organization/${organizationId}/board/${boardId}/list`,
  );

  return Promise.all(
    response.data.data.map(async (list) => {
      const cardsResponse = await api.get<BoardCard[]>(
        `/lists/${list.id}/cards`,
      );
      return { ...list, cards: cardsResponse.data };
    }),
  );
}

export async function createList(
  organizationId: string,
  boardId: string,
  input: ListInput,
): Promise<BoardList> {
  const response = await api.post<{ data: BoardList }>(
    `/organization/${organizationId}/board/${boardId}/list`,
    input,
  );
  return response.data.data;
}

export async function updateList(
  organizationId: string,
  boardId: string,
  listId: string,
  input: Partial<ListInput>,
): Promise<BoardList> {
  const response = await api.patch<{ data: BoardList }>(
    `/organization/${organizationId}/board/${boardId}/list/${listId}`,
    input,
  );
  return response.data.data;
}

export async function deleteList(
  organizationId: string,
  boardId: string,
  listId: string,
): Promise<void> {
  await api.delete(
    `/organization/${organizationId}/board/${boardId}/list/${listId}`,
  );
}
