import { NextFunction, Request, Response } from "express";

/**
 * Route bất đồng bộ
 */
export const asyncRoute =
    (
        func: (
            request: Request,
            response: Response,
            next: NextFunction
        ) => any
    ) =>
    (req: Request, res: Response, next: NextFunction) => {
        return Promise.resolve(func(req, res, next)).catch(next);
    };
