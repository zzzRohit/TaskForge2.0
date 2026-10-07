import { api } from "./client";
import type { BoardCard } from "../../types/taskforge";

export type CardInput = {
  title: string;
  description?: string;
};

export async function createCard(
  boardId: string,
  listId: string,
  input: CardInput,
): Promise<BoardCard> {
  const response = await api.post<BoardCard>(
    `/boards/${boardId}/lists/${listId}/cards`,
    input,
  );
  return response.data;
}

export async function updateCard(
  boardId: string,
  cardId: string,
  input: Partial<CardInput>,
): Promise<BoardCard> {
  const response = await api.patch<BoardCard>(
    `/boards/${boardId}/cards/${cardId}`,
    input,
  );
  return response.data;
}

export async function deleteCard(
  boardId: string,
  cardId: string,
): Promise<void> {
  await api.delete(`/boards/${boardId}/cards/${cardId}`);
}

export async function moveCard(
  boardId: string,
  cardId: string,
  targetListId: string,
  position: number,
): Promise<BoardCard> {
  const response = await api.patch<BoardCard>(
    `/boards/${boardId}/cards/${cardId}/move`,
    {
      position,
      targetListId,
    },
  );
  return response.data;
}
