import { body, CustomValidator } from "express-validator";
import { Knex } from "knex";
import UserModel from "../../models/UserModel";
import UserTypeModel from "../../models/UserTypeModel";
import { exists } from "../../utils/validator";

export const UserType = {
    ADMIN: 1,
    IMPORTER: 2,
    STUDENT: 3,
}

export const isAdmin = (auth: any) => auth.user_type_id === UserType.ADMIN;
export const isImporter = (auth: any) => auth.user_type_id === UserType.IMPORTER;
export const isStudent = (auth: any) => auth.user_type_id === UserType.STUDENT;

//Fetch options
export const fetchOptions = {
    withRelated: ["user_type"],
};

//List
export const listSearch = ["username", "first_name", "last_name"];

export const listQuery = (queryBuilder: Knex.QueryBuilder<any, any>) => queryBuilder.whereIn("user_type_id", [1, 2]);

//Insert and Update
const checkUserTypeIdExists: CustomValidator = (value, {req}) => exists(UserTypeModel, "id", value, req.body.user_type_id ? [req.body.user_type_id] : []);
const checkUserNameExists: CustomValidator = (value, {req}) => exists(UserModel, "username", value, req.params?.id ? [req.params?.id] : []);
const checkEmailExists: CustomValidator = (value, {req}) => exists(UserModel, "email", value, req.params?.id ? [req.params?.id] : []);
export const updateRules = [
    body("user_type_id")
        .notEmpty().withMessage("Không được để trống")
        .not().custom(checkUserTypeIdExists).withMessage("Email đã tồn tại"),
    body("first_name").notEmpty().withMessage("Không được để trống"),
    body("last_name").notEmpty().withMessage("Không được để trống"),
    body("email")
        .notEmpty().withMessage("Không được để trống")
        .isEmail().withMessage("Không phải là email")
        .not().custom(checkEmailExists).withMessage("Email đã tồn tại"),
    body("username")
        .notEmpty().withMessage("Không được để trống")
        .isAlphanumeric().withMessage("Chỉ được phép kí tự chữ cái (A-Z), (a-z) và (0-9)")
        .isLength({ min: 3, max: 20 }).withMessage("Độ dài ít nhất là 3 và tối đa là 20")
        .not().custom(checkUserNameExists).withMessage("Tên tài khoản đã tồn tại"),
];

export const insertRules = [
    ...updateRules,
    body("password").notEmpty().withMessage("Không được để trống"),
];

export const insertFields = [
    "user_type_id",
    "username",
    "password",
    "first_name",
    "last_name",
    "email",
];

export const updateFields = ["first_name", "last_name", "email"];