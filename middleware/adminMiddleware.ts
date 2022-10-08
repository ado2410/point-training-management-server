import { NextFunction, Request, Response } from "express";
import { isAdmin } from "../routes/User/User.constants";
import { throwError } from "../utils/error";

/**
 * Middleware dùng để kiểm tra người dùng có phải là admin hay không
 */
export default (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.auth as any;
    const canInsert = isAdmin(auth);
    if (canInsert) return next();
    else return throwError(res, "ACTIVITY", "Không có quyền thực hiện");
}