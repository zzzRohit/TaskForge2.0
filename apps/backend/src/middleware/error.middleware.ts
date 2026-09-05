import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error";

export const errorHandler = (
    error: Error,
    request: Request,
    response: Response,
    next: NextFunction
) => {
    if (error instanceof AppError) {
        return response.status(error.statusCode).json({
            error: error.message,
        });
    }

    console.error(error);

    return response.status(500).json({
        error: "Internal server error",
    });
};