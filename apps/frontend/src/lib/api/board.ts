import { api } from "./client";
import type { Board, BoardMember } from "../../types/taskforge";

type CreateBoardInput = {
  title: string;
  description?: string;
};

export async function getBoards(organizationId: string): Promise<Board[]> {
  const response = await api.get<Board[]>(
    `/organization/${organizationId}/boards`,
  );
  return response.data;
}

export async function createBoard(
  organizationId: string,
  input: CreateBoardInput,
): Promise<Board> {
  const response = await api.post<Board>(
    `/organization/${organizationId}/board`,
    input,
  );
  return response.data;
}
export async function getBoard(
  organizationId: string,
  boardId: string,
): Promise<Board> {
  const response = await api.get<Board>(
    `/organization/${organizationId}/board/${boardId}`,
  );
  return response.data;
}

export async function updateBoard(
  organizationId: string,
  boardId: string,
  input: CreateBoardInput,
): Promise<Board> {
  const response = await api.patch<Board>(
    `/organization/${organizationId}/board/${boardId}`,
    input,
  );
  return response.data;
}

export async function deleteBoard(
  organizationId: string,
  boardId: string,
): Promise<Board> {
  const response = await api.delete<Board>(
    `/organization/${organizationId}/board/${boardId}`,
  );
  return response.data;
}

export async function getBoardMembers(
  organizationId: string,
  boardId: string,
): Promise<BoardMember[]> {
  const response = await api.get<BoardMember[]>(
    `/organization/${organizationId}/board/${boardId}/members`,
  );
  return response.data;
}

export async function addBoardMember(
  organizationId: string,
  boardId: string,
  userId: string,
): Promise<void> {
  await api.post(`/organization/${organizationId}/board/${boardId}/members`, {
    userId,
  });
}

export async function removeBoardMember(
  organizationId: string,
  boardId: string,
  userId: string,
): Promise<void> {
  await api.delete(
    `/organization/${organizationId}/board/${boardId}/members/${userId}`,
  );
}
