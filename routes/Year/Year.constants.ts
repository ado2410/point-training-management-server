import { body, CustomValidator } from "express-validator";
import YearModel from "../../models/YearModel";
import { exists } from "../../utils/validator";

//List
export const listSearch = ["name"];

//Insert and Update
const checkNameExists: CustomValidator = (value, {req}) => exists(YearModel, "name", value, req.params?.id ? [req.params?.id] : []);
export const insertAndUpdateRules = [
    body("name").notEmpty().withMessage("Không được để trống")
    .not().custom(checkNameExists).withMessage("Năm học đã tồn tại"),
];

export const insertAndUpdateFields = ["name"];