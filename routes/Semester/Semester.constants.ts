import { check, CustomValidator } from "express-validator";
import { exists } from "../../utils/validator";
import SemesterModel from "../../models/SemesterModel";
import YearModel from "../../models/YearModel";
import ClassModel from "../../models/ClassModel";
import UserModel from "../../models/UserModel";
import GroupModel from "../../models/GroupModel";
import { db } from "../../utils/db";
import { Knex } from "knex";
import { Request } from "express";

const checkSemesterExists: CustomValidator = (value, { req }) =>
    exists(SemesterModel, "name", value, [], (qb) =>
        qb.where("year_id", req.body.year_id)
    );

export const rules = [
    check("name")
        .notEmpty()
        .withMessage("Không được để trống")
        .isIn([1, 2])
        .withMessage("Sai học kỳ")
        .not()
        .custom(checkSemesterExists)
        .withMessage("Đã tồn tại trong CSDL"),
    check("year_id").notEmpty().withMessage("Không được để trống"),
];

export const handleSemester = (queryBuilder: any, semester: any) => {
    if (semester !== "null") return queryBuilder.where("semester_id", semester);
    else return queryBuilder.whereNull("semester_id");
};

export const listQuery = (queryBuilder: Knex.QueryBuilder<any, any>, req: Request) => {
    const yearId = req.query.year as string;
    if (yearId) queryBuilder = queryBuilder.where("year_id", yearId);
    return queryBuilder;
}

export const createOptions = {
    years: () => new YearModel().fetchAll(),
    keys: () => new ClassModel()
        .query(qb => qb.select(db.raw("DISTINCT SUBSTRING(classes.name, 1, 3) AS id"), db.raw("CONCAT('Khóa ', SUBSTRING(classes.name, 1, 3)) AS name"))
        .orderBy("id", "DESC"))
        .fetchAll(),
    editors: () => new UserModel()
        .where("user_type_id", 2)
        .query(qb => qb.select("id", db.raw("CONCAT(username, ' - ', first_name, ' ', last_name) AS name")))
        .fetchAll(),
    groups: () => new GroupModel().fetchAll({columns: ['id', db.raw('get_group_full_code(id) AS name') as any]}),
}