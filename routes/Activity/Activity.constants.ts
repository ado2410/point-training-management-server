import { body, CustomValidator } from "express-validator";
import ActivityTypeModel from "../../models/ActivityTypeModel";
import GroupModel from "../../models/GroupModel";
import { exists } from "../../utils/validator";

const activityExists: CustomValidator = (value) => exists(ActivityTypeModel, "id", value);
const groupExists: CustomValidator = (value) => exists(GroupModel, "id", value);

export const activityRules = [
    body("activity_type_id")
        .notEmpty().withMessage("Không được để trống")
        .custom(activityExists).withMessage("Không tồn tại trong CSDL"),
    body("group_id")
        .notEmpty().withMessage("Không được để trống")
        .custom(groupExists).withMessage("Không tồn tại trong CSDL"),
    body("name").notEmpty().withMessage("Không được để trống"),
    body("time_start").not().isDate().withMessage("Không phải kiểu ngày"),
    body("time_end").not().isDate().withMessage("Không phải kiểu ngày"),
    body("type")
        .notEmpty().withMessage("Không được để trống")
        .isIn(["CHECK", "COUNT", "ENUM", "POINT"]).withMessage("Không đúng kiểu"),
];

export const activityImportRules = [
    body("*.activity_type_id")
        .notEmpty().withMessage("Không được để trống")
        .custom(activityExists).withMessage("Không tồn tại trong CSDL"),
    body("*.group_id")
        .notEmpty().withMessage("Không được để trống")
        .custom(groupExists).withMessage("Không tồn tại trong CSDL"),
    body("*.name").notEmpty().withMessage("Không được để trống"),
    body("*.time_start").not().isDate().withMessage("Không phải kiểu ngày"),
    body("*.time_end").not().isDate().withMessage("Không phải kiểu ngày"),
    body("*.type")
        .notEmpty().withMessage("Không được để trống")
        .isIn(["CHECK", "COUNT", "ENUM", "POINT"]).withMessage("Không đúng kiểu")
];
