import { Request, Response } from "express";
import { AppError } from "../utils/app-error";
import * as listservice from "../service/list.service";
import { getIO } from "../lib/socket";
export const createList = async (
  req: Request<{ boardId: string; organizationId: string }>,
  res: Response,
) => {
  const { boardId } = req.params;
  const { title, position } = req.body;
  if (!title) {
    throw new AppError("Title is required ", 400);
  }
  const list = await listservice.createList({ title, position, boardId });

  res.status(201).json({ status: "success", data: list });
};
export const getListsByBoardId = async (
  req: Request<{ boardId: string; organizationId: string }>,
  res: Response,
) => {
  const { boardId, organizationId } = req.params;
  await listservice.assertBoardAccess(organizationId, boardId, req.userId!);
  const lists = await listservice.getListsByBoardId(boardId);
  res.status(200).json({ status: "success", data: lists });
};
export const getlist = async (
  req: Request<{ boardId: string; organizationId: string; listId: string }>,
  res: Response,
) => {
  const { listId } = req.params;
  const list = await listservice.getListById(listId);
  if (!list) {
    throw new AppError("List not found", 404);
  }
  res.status(200).json({ status: "success", data: list });
};
export const updateList = async (
  req: Request<{ boardId: string; organizationId: string; listId: string }>,
  res: Response,
) => {
  const { listId , boardId} = req.params;
  const { title, position } = req.body;
  const list = await listservice.getListById(listId);
  if (!list) {
    throw new AppError("List not found", 404);
  }
  const updatedList = await listservice.updateList(listId, { title, position });
  const io = getIO();
  io.to(boardId).emit("list-updated", updatedList);
  res.status(200).json({ status: "success", data: updatedList });
};
export const deleteList = async (
  req: Request<{ boardId: string; organizationId: string; listId: string }>,
  res: Response,
) => {
  const { listId, boardId } = req.params;
  const list = await listservice.getListById(listId);
  if (!list) {
    throw new AppError("List not found", 404);
  }
  await listservice.deleteList(listId);
  const io = getIO();
  io.to(boardId).emit("list-deleted", listId);
  res
    .status(200)
    .json({
      status: "success",
      message: "List deleted successfully",
      data: null,
    });
};
