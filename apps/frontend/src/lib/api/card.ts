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
  cardId: string,
  input: Partial<CardInput>,
): Promise<BoardCard> {
  const response = await api.patch<BoardCard>(`/cards/${cardId}`, input);
  return response.data;
}

export async function deleteCard(cardId: string): Promise<void> {
  await api.delete(`/cards/${cardId}`);
}

export async function moveCard(
  cardId: string,
  targetListId: string,
  position: number,
): Promise<BoardCard> {
  const response = await api.patch<BoardCard>(`/card/${cardId}/move`, {
    position,
    targetListId,
  });
  return response.data;
}
