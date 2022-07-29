import { Request } from "express";
import { body, CustomValidator } from "express-validator";
import { Knex } from "knex";
import ClassModel from "../../models/ClassModel";
import MajorModel from "../../models/MajorModel";
import { exists } from "../../utils/validator";

//Fetch options
export const fetchOptions = {
    withRelated: ["major.department"],
}

//List Query
export const listSearch = ["name"];

export const listQuery = (queryBuilder: Knex.QueryBuilder<any, any>, req: Request) => {
    const majorId = req.query.major as string;
    if (majorId) queryBuilder.where("major_id", majorId);
    return queryBuilder;
}

//Create
export const createOptions = {
    majors: new MajorModel().fetchAll(),
}

//Insert và update
const checkNameExists: CustomValidator = (value, {req}) => exists(ClassModel, "name", value, req.params?.id ? [req.params?.id] : []);
export const insertAndUpdateRules = [
    body("name")
        .notEmpty().withMessage("Không được để trống")
        .not().custom(checkNameExists).withMessage("Lớp đã tồn tại"),
    body("major_id").notEmpty().withMessage("Không được để trống"),
];

export const fields = ["name", "major_id"];