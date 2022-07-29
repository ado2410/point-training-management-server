import { NextFunction, Request, Response } from "express";
import UserModel from "../../models/UserModel";
import { throwError } from "../../utils/error";
import { isAdmin, isImporter } from "../User/User.constants";

export const viewAndUpdateMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.auth as any;
    if (isAdmin(auth)) return next();
    if (isImporter(auth)) return throwError(res, "STUDENT", "Không có quyền thực hiện");
    
    const studentId = req.params.id;
    const user = (await new UserModel({id: auth.id}).fetch({withRelated: ["student"]})).toJSON();
    
    const canAccess = user.student.id == studentId;
    if (canAccess) return next();
    else return throwError(res, "STUDENT", "Không có quyền thực hiện");
}