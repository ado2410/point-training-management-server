import { NextFunction, Request, Response } from "express";
import { throwError } from "../utils/error";

export default (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.auth) return next();
    else return throwError(res, "login", "Chưa đăng nhập");
}