import { Request } from "express";
import { body, CustomValidator } from "express-validator";
import { Knex } from "knex";
import DepartmentModel from "../../models/DepartmentModel";
import MajorModel from "../../models/MajorModel";
import { exists } from "../../utils/validator";

//Fetch options
export const fetchOptions = {
    withRelated: ["department"],
}

//List
export const listSearch = ["name"];

export const listQuery = (queryBuilder: Knex.QueryBuilder<any, any>, req: Request) => {
    const departmentId = req.query.department as string;
    if (departmentId) queryBuilder.where("department_id", departmentId)
    return queryBuilder;
}

//Create
export const createOptions = {
    departments: () => new DepartmentModel().fetchAll(),
}

//Insert And Update
const checkNameExists: CustomValidator = (value, {req}) => exists(MajorModel, "name", value, req.params?.id ? [req.params?.id] : []);
export const insertAndUpdateRules = [
    body("name")
        .notEmpty().withMessage("Không được để trống")
        .not().custom(checkNameExists).withMessage("Ngành học đã tồn tại"),
    body("department_id").notEmpty().withMessage("Không được để trống"),
];

export const insertAndUpdateFields = ["name", "department_id"];