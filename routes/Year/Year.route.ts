import { check } from "express-validator";
import adminMiddleware from "../../middleware/adminMiddleware";
import loginMiddleware from "../../middleware/loginMiddleware";
import YearModel from "../../models/YearModel";
import templateRoute from "../template/template.route";

const rules = [
    check("name").notEmpty().withMessage("Không được để trống"),
];

export default templateRoute(YearModel, {
    middleware: [loginMiddleware, adminMiddleware],
    insert: {
        rules: rules,
        fields: ["name"],
    },
    update: {
        rules: rules,
        fields: ["name"],
    },
});