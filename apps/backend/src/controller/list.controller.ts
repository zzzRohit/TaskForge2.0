import {Request , Response} from "express"
import { AppError } from "../utils/app-error";
import * as listservice from "../service/list.service";
export const createList = async (req:Request<{boardId: string , organizationId: string}>, res: Response) => {
    const { boardId } = req.params;
    const {title, position} = req.body;
    if(!title){
        throw new AppError("Title is required ", 400);
    }
    const list = await listservice.createList({title , position, boardId  });
    
    res.status(201).json({status:"success" , data:list});
}