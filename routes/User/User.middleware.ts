import { NextFunction, Request, Response } from "express";
import { throwError } from "../../utils/error";
import { isAdmin } from "./User.constants";

export const viewMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.auth as any;
    const userId = req.params.id;
    if (isAdmin(auth)) return next();
    else if (userId == auth.id) return next();
    else return throwError(res, "USER", "Không có quyền thực hiện");
}