import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { throwError } from "../utils/error";

/**
    Middleware dùng để kiểm tra access token của người dùng gửi lên có hợp lệ hay không
*/
export default (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization;
    let accessToken = authorization;
    if (authorization === undefined) {
        return next();
    } else {
        accessToken = authorization.split(" ")[1];
        const accessTokenKey = process.env.ACCESS_TOKEN_KEY;
        try {
            const auth = jwt.verify(accessToken, accessTokenKey!);
            req.headers.auth = auth as any;
            return next();
        } catch {
            return throwError(res, "ACCESS-TOKEN-EXPIRED", "Phiên đăng nhập đã hết hạn");
        }
    };
}