import { check } from "express-validator";
import DepartmentModel from "../models/DepartmentModel";
import templateRoute from "./template/template.route";

const rules = [
    check("name")
        .notEmpty().withMessage("Không được để trống"),
];

export default templateRoute(
    DepartmentModel,
    {
        list: {
            search: ["name"],
        },
        insert: {
            rules: rules,
            fields: ["name"]
        },
        update: {
            rules: rules,
            fields: ["name"]
        }
    }
);