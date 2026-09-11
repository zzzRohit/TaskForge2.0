import { Request, Response } from 'express';
import * as boardService from '../service/board.service';
export const createBoard = async (req: Request<{ organizationId: string }>, res: Response) => {
    const { organizationId } = req.params;
    const { title, description } = req.body;
    const userId = req.userId!; // Assuming userId is set in the auth middleware

    
    if (!title) {
        return res.status(400).json({ error: 'Board title is required' });
    }
    const board = await boardService.createBoard({ organizationId, title, description, userId });
    res.status(201).json(board);
}
export const getBoardsByOrganizationId = async (req: Request<{ organizationId: string }>, res: Response) => {
    const { organizationId } = req.params;
    const boards = await boardService.getBoardsByOrganizationId(organizationId);
    res.status(200).json(boards);
}
export const getBoardById = async (req: Request<{ organizationId: string, boardId: string }>, res: Response) => { 
    const { organizationId, boardId } = req.params;
    const board = await boardService.getBoardById(organizationId, boardId);
    if (!board) {
        return res.status(404).json({ error: 'Board not found' });
    }
    res.status(200).json(board);
}
export const updateBoard = async (req: Request<{ organizationId: string, boardId: string }>, res: Response) => {
    const { organizationId, boardId } = req.params;
    const { title, description } = req.body;
    const userId = req.userId!; // Assuming userId is set in the auth middleware
    const updatedBoard = await boardService.updateBoard({ organizationId, boardId, title, description, userId });
    if (!updatedBoard) {
        return res.status(404).json({ error: 'Board not found or you do not have permission to update it' });
    }
    res.status(200).json(updatedBoard);
}