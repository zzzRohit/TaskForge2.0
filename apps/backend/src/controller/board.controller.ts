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