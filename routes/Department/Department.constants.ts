import { body, CustomValidator } from "express-validator";
import DepartmentModel from "../../models/DepartmentModel";
import { exists } from "../../utils/validator";

//List
export const listSearch = ["name"];

//Insert and Update
const checkNameExists: CustomValidator = (value, {req}) => exists(DepartmentModel, "name", value, req.params?.id ? [req.params?.id] : []);
export const insertAndUpdateRules = [
    body("name")
        .notEmpty().withMessage("Không được để trống")
        .not().custom(checkNameExists).withMessage("Khoa đã tồn tại"),
];

export const insertAndUpdateFields = ["name"];