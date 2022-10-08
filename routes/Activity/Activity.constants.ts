import { Request, Response } from "express";
import { body, CustomValidator } from "express-validator";
import { Knex } from "knex";
import ActivityModel from "../../models/ActivityModel";
import ActivityTypeModel from "../../models/ActivityTypeModel";
import ClassModel from "../../models/ClassModel";
import DepartmentModel from "../../models/DepartmentModel";
import GroupModel from "../../models/GroupModel";
import SemesterModel from "../../models/SemesterModel";
import { db } from "../../utils/db";
import { exists } from "../../utils/validator";
import { groupOptions } from "../Group/Group.actions";
import { isAdmin } from "../User/User.constants";
import { getActivityCodeRawBuilder, getCanModifyActivityRawBuilder, getCanModifyAttendanceRawBuilder } from "./Activity.actions";

//Fetch options
export const fetchOptions = async (req: Request) => {
    const auth = req.headers.auth as any;
    let semesterId = (req.query.semester || req.body.semester_id) as string;
    //Nếu không tìm thấy trên params hoặc body
    if (!semesterId) {
        const activityId = req.params.id;
        if (activityId) {
            const activity = (await new ActivityModel({id: activityId}).fetch()).toJSON();
            semesterId = activity.semester_id;
        }
    }
    return {
        columns: ["*", getActivityCodeRawBuilder(semesterId, "id"), getCanModifyActivityRawBuilder(auth), getCanModifyAttendanceRawBuilder(semesterId, auth)],
        withRelated: ["activity_type", "semester.year"],
    };
};

//List
export const listSearch = (req: Request) => [
    db.raw(`get_activity_code(${req.query.semester}, activities.id)`) as any,
    "name",
];

export const listQuery = (queryBuilder: Knex.QueryBuilder<any, any>, req: Request) => {
    const semesterId = req.query.semester as string;
    const activityTypeId = req.query.activity_type as string;

    queryBuilder.where("semester_id", semesterId);
    if (activityTypeId) queryBuilder.where("activity_type_id", activityTypeId);
    return queryBuilder;
};

//Create
export const createOptions = {
    departments: new DepartmentModel().fetchAll(),
    classes: new ClassModel().fetchAll(),
    groups: groupOptions,
    import_groups: () => new GroupModel().fetchAll({columns: ['id', db.raw('get_group_full_code(id) AS name') as any]}),
};

//Import
const checkActivityIdExists: CustomValidator = (value) => exists(ActivityTypeModel, "id", value);

const checkGroupIdExists: CustomValidator = (value) => exists(GroupModel, "id", value);

export const importRules = [
    body("*.activity_type_id")
        .notEmpty().withMessage("Không được để trống")
        .custom(checkActivityIdExists).withMessage("Không tồn tại trong CSDL"),
    body("*.group_id")
        .notEmpty().withMessage("Không được để trống")
        .custom(checkGroupIdExists).withMessage("Không tồn tại trong CSDL"),
    body("*.name").notEmpty().withMessage("Không được để trống"),
    body("*.time_start").not().isDate().withMessage("Không phải kiểu ngày"),
    body("*.time_end").not().isDate().withMessage("Không phải kiểu ngày"),
    body("*.type")
        .notEmpty().withMessage("Không được để trống")
        .isIn(["CHECK", "COUNT", "ENUM", "POINT"]).withMessage("Không đúng kiểu")
];

export const importFields = [
    "semester_id",
    "activity_type_id",
    "group_id",
    "name",
    "time_start",
    "time_end",
    "address",
    "host",
    "description",
    "type",
    "accepts",
    "default_value",
];

//Insert
const checkInGroup: CustomValidator = async (input, {req}) => {
    const auth = req.headers?.auth as any;
    if (isAdmin(auth)) return true;
    else {
        const isInGroup = (await db.raw(`SELECT is_in_group FROM is_in_group(${auth.id}, ${input})`)).rows[0].is_in_group;
        if (isInGroup) return Promise.resolve();
        else return Promise.reject();
    };
}

export const insertRules = [
    body("activity_type_id")
        .notEmpty().withMessage("Không được để trống")
        .custom(checkActivityIdExists).withMessage("Không tồn tại trong CSDL"),
    body("group_id")
        .notEmpty().withMessage("Không được để trống")
        .custom(checkGroupIdExists).withMessage("Không tồn tại trong CSDL")
        .custom(checkInGroup).withMessage("Không được phép truy cập nhóm này"),
    body("name").notEmpty().withMessage("Không được để trống"),
    body("time_start").not().isDate().withMessage("Không phải kiểu ngày"),
    body("time_end").not().isDate().withMessage("Không phải kiểu ngày"),
    body("type")
        .notEmpty().withMessage("Không được để trống")
        .isIn(["CHECK", "COUNT", "ENUM", "POINT"]).withMessage("Không đúng kiểu"),
    body("attendance_open").isBoolean().withMessage("Không phải kiểu true/false"),
    body("attendance_start").not().isDate().withMessage("Không phải kiểu ngày"),
    body("attendance_end").not().isDate().withMessage("Không phải kiểu ngày"),
];

export const insertFields = [
    "semester_id",
    "activity_type_id",
    "group_id",
    "name",
    "time_start",
    "time_end",
    "address",
    "host",
    "description",
    "type",
    "accepts",
    "default_value",
    "attendance",
];

//Update
export const updateRules = insertRules;

export const updateFields = [
    "group_id",
    "name",
    "time_start",
    "time_end",
    "address",
    "host",
    "description",
    "type",
    "accepts",
    "default_value",
    "attendance",
];

//Extra
export const getSemesterActivityAction = async (req: Request, res: Response) => {
    const semesterActivities = await new SemesterModel().query(queryBuilder =>
        queryBuilder.leftJoin("activities", "activities.semester_id", "semesters.id")
            .groupBy("semesters.id")
            .select(
                "semesters.*",
                db.raw("COUNT(*) FILTER (WHERE activity_type_id = 1) AS type_1"),
                db.raw("COUNT(*) FILTER (WHERE activity_type_id = 2) AS type_2"),
                db.raw("COUNT(*) FILTER (WHERE activity_type_id = 3) AS type_3"),
            )
    ).fetchAll({withRelated: ["year"]});
    return res.json({data: semesterActivities});
}