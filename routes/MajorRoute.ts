import { check } from "express-validator";
import DepartmentModel from "../models/DepartmentModel";
import MajorModel from "../models/MajorModel";
import templateRoute from "./template/template.route";

const rules = [
    check("name")
        .notEmpty().withMessage("Không được để trống"),
    check("department_id")
        .notEmpty().withMessage("Không được để trống"),
];

export default templateRoute(
    MajorModel,
    {
        fetchOptions: {
            withRelated: ["department"],
        },
        list: {
            query: (qb, req) => {
                const departmentId = req.query.department as string;
                if (departmentId) qb = qb.where("department_id", departmentId)
                return qb;
            },
        },
        create: {
            options: {
                departments: () => new DepartmentModel().fetchAll(),
            }
        },
        insert: {
            rules: rules,
            fields: ["name", "department_id"]
        },
        update: {
            rules: rules,
            fields: ["name"]
        }
    }
);