import { NextFunction, Request, Response } from "express";
import SemesterModel from "../../models/SemesterModel";
import { throwError } from "../../utils/error";
import { isAdmin, isImporter } from "../User/User.constants";

/**
 * Middleware kiểm tra người dùng có quyền truy cập học kỳ
 * Nếu là admin: Hoàn toàn có quyền truy cập.
 * Nếu là người nhập liệu: Hoàn toàn có quyền truy cập
 * Nếu là sinh viên: Có quyền truy cập khi được mở công khai (public)
 */
export const semesterMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const semesterId = req.params.id;
    if (!semesterId) return throwError(res, "SEMESTER", "Id không tìm thấy");
    const auth = req.headers.auth as any;
    if (isAdmin(auth)) return next();
    else if (isImporter(auth)) return next();
    else {
        const semester: any = (await new SemesterModel({id: semesterId}).fetch()).toJSON();
        if (semester.settings.status === 'public') return next();
        else return throwError(res, "SEMESTER", "Không có quyền thực hiện");
    }
}