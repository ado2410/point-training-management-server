import { NextFunction, Request, Response } from "express";
import SemesterModel from "../../models/SemesterModel";
import { throwError } from "../../utils/error";
import { isAdmin, isImporter, UserType } from "../User/User.constants";
import { canModifyActivity } from "./Activity.actions";

/**
 * Middleware kiểm tra người dùng có quyền thêm hoạt động mới
 */
export const canInsertActivityMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.auth as any;
    const canInsert = isAdmin(auth) || isImporter(auth);
    if (canInsert) return next();
    else return throwError(res, "ACTIVITY", "Không có quyền thực hiện");
}

/**
 * Middleware kiểm tra người dùng có quyền chỉnh sửa hoạt động
 */
export const canModifyActivityMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const activityId = req.params.activityId;
    const canModify = await canModifyActivity(activityId, req.headers.auth);
    if (canModify) return next();
    else return throwError(res, "ACTIVITY", "Không có quyền thực hiện");
}

/**
 * Middleware kiểm tra người dùng có quyền truy cập học kỳ
 */
export const accessSemesterMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const semesterId = req.query.semester as string;
    const auth = req.headers.auth as any;
    if (isAdmin(auth)) return next();
    else if (isImporter(auth)) return next();
    else {
        const semester: any = (await new SemesterModel({id: semesterId}).fetch()).toJSON();
        if (semester.settings.status === 'public') return next();
        else return throwError(res, "SEMESTER", "Không có quyền thực hiện");
    }
}