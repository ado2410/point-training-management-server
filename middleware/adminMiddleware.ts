import { NextFunction, Request, Response } from "express";
import { UserType } from "../routes/User/User.constants";
import { throwError } from "../utils/error";

export default (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.auth as any;
    const canInsert = auth.user_type_id === UserType.ADMIN;
    if (canInsert) return next();
    else return throwError(res, "ACTIVITY", "Không có quyền thực hiện");
}