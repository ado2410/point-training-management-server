import { NextFunction, Request, Response } from "express";
import SemesterModel from "../../models/SemesterModel";
import UserModel from "../../models/UserModel";
import { throwError } from "../../utils/error";
import { isAdmin, isImporter } from "../User/User.constants";

export const listMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.auth as any;
    if (isAdmin(auth)) return next();
    else if (isImporter(auth)) return next();
    else return throwError(res, "STUDENT", "Không có quyền thực hiện");
}

export const getSemesterStudentMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.auth as any;
    if (isAdmin(auth)) return next();
    
    const studentId = req.params.studentId;
    const user = (await new UserModel({id: auth.id}).fetch({withRelated: ["student"]})).toJSON();
    
    const canAccess = user.student.id == studentId;
    if (canAccess) return next();
    else return throwError(res, "SEMESTER_STUDENT", "Không có quyền thực hiện");
}

export const semesterMiddleware = async (req: Request, res: Response, next: NextFunction) => {
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