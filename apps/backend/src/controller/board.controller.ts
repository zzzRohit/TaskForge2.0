import { Request, Response } from "express";
import * as boardService from "../service/board.service";
export const createBoard = async (
  req: Request<{ organizationId: string }>,
  res: Response,
) => {
  const { organizationId } = req.params;
  const { title, description } = req.body;
  const userId = req.userId!; // Assuming userId is set in the auth middleware

  if (!title) {
    return res.status(400).json({ error: "Board title is required" });
  }
  const board = await boardService.createBoard({
    organizationId,
    title,
    description,
    userId,
  });
  res.status(201).json(board);
};
export const getBoardsByOrganizationId = async (
  req: Request<{ organizationId: string }>,
  res: Response,
) => {
  const { organizationId } = req.params;
  const boards = await boardService.getBoardsByOrganizationId(
    organizationId,
    req.userId!,
  );
  res.status(200).json(boards);
};
export const getBoardById = async (
  req: Request<{ organizationId: string; boardId: string }>,
  res: Response,
) => {
  const { organizationId, boardId } = req.params;
  const board = await boardService.getBoardById(
    organizationId,
    boardId,
    req.userId!,
  );
  if (!board) {
    return res.status(404).json({ error: "Board not found" });
  }
  res.status(200).json(board);
};
export const updateBoard = async (
  req: Request<{ organizationId: string; boardId: string }>,
  res: Response,
) => {
  const { organizationId, boardId } = req.params;
  const { title, description } = req.body;
  const userId = req.userId!; // Assuming userId is set in the auth middleware
  const updatedBoard = await boardService.updateBoard({
    organizationId,
    boardId,
    title,
    description,
    userId,
  });
  if (!updatedBoard) {
    return res
      .status(404)
      .json({
        error: "Board not found or you do not have permission to update it",
      });
  }
  res.status(200).json(updatedBoard);
};
export const deleteBoard = async (
  req: Request<{ organizationId: string; boardId: string }>,
  res: Response,
) => {
  const { organizationId, boardId } = req.params;
  const userId = req.userId!; // Assuming userId is set in the auth middleware
  const deletedBoard = await boardService.deleteBoard({
    organizationId,
    boardId,
    userId,
  });
  if (!deletedBoard) {
    return res
      .status(404)
      .json({
        error: "Board not found or you do not have permission to delete it",
      });
  }
  res.status(200).json(deletedBoard);
};

export const getMembers = async (
  req: Request<{ organizationId: string; boardId: string }>,
  res: Response,
) => {
  const members = await boardService.getMembers(
    req.params.organizationId,
    req.params.boardId,
    req.userId!,
  );
  if (!members) return res.status(404).json({ error: "Board not found" });
  return res.status(200).json(members);
};

export const addMember = async (
  req: Request<{ organizationId: string; boardId: string }>,
  res: Response,
) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "User ID is required" });
  const member = await boardService.addMember({
    actorUserId: req.userId!,
    organizationId: req.params.organizationId,
    boardId: req.params.boardId,
    userId,
  });
  return res.status(201).json(member);
};

export const removeMember = async (
  req: Request<{ organizationId: string; boardId: string; userId: string }>,
  res: Response,
) => {
  await boardService.removeMember({
    actorUserId: req.userId!,
    organizationId: req.params.organizationId,
    boardId: req.params.boardId,
    userId: req.params.userId,
  });
  return res.status(204).send();
};
