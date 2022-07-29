import { NextFunction, Request, Response } from "express";
import { throwError } from "../../utils/error";
import { canModifyAttendance } from "./Attendance.actions";

export const canModifyAttendanceMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const activityId = req.body.activity_id;
    const studentId = req.body.student_id;
    const canModify = await canModifyAttendance(activityId, studentId, req.headers.auth);
    if (canModify) return next();
    else return throwError(res, "ATTENDANCE", "Không có quyền thực hiện");
}