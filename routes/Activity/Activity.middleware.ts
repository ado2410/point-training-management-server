import { NextFunction, Request, Response } from "express";
import { throwError } from "../../utils/error";
import { UserType } from "../User/User.constants";
import { canModifyActivity } from "./Activity.actions";

export const canInsertActivityMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.auth as any;
    const canInsert = auth.user_type_id === UserType.ADMIN || auth.user_type_id === UserType.IMPORTER;
    if (canInsert) return next();
    else return throwError(res, "ACTIVITY", "Không có quyền thực hiện");
}

export const canModifyActivityMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const activityId = req.params.activityId;
    const canModify = await canModifyActivity(activityId, req.headers.auth);
    if (canModify) return next();
    else return throwError(res, "ACTIVITY", "Không có quyền thực hiện");
}