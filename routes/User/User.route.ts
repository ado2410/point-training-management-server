import { check } from "express-validator";
import UserModel from "../../models/UserModel";
import TemplateRoute from "../template/template.route";

const rules = [
    check("user_type_id").notEmpty().withMessage("Không được để trống"),
    check("first_name").notEmpty().withMessage("Không được để trống"),
    check("last_name").notEmpty().withMessage("Không được để trống"),
    check("email")
        .notEmpty().withMessage("Không được để trống")
        .isEmail().withMessage("Không phải là email"),
    check("username")
        .notEmpty().withMessage("Không được để trống")
        .isAlphanumeric().withMessage("Chỉ được phép kí tự chữ cái (A-Z), (a-z) và (0-9)")
        .isLength({ min: 3, max: 20 }).withMessage("Độ dài ít nhất là 3 và tối đa là 20"),
];

const createRules = [
    ...rules,
    check("password").notEmpty().withMessage("Không được để trống"),
];

export default TemplateRoute(UserModel, {
    fetchOptions: {
        withRelated: ["user_type"],
    },
    list: {
        query: (qb) => qb.whereIn("user_type_id", [1, 2]),
        search: ["username", "first_name", "last_name"],
    },
    insert: {
        rules: createRules,
        fields: [
            "user_type_id",
            "username",
            "password",
            "first_name",
            "last_name",
            "email",
        ],
    },
    update: {
        rules: rules,
        fields: ["first_name", "last_name", "email"],
    },
});
