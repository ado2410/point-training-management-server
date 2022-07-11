import { Response } from "express";

export const throwError = (res: Response, key: string, content: string) => {
    return res.status(400).json({ key: key, content: content });
};
