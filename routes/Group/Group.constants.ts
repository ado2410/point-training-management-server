import { Request } from "express";
import { body, CustomValidator } from "express-validator";
import { Knex } from "knex";
import GroupModel from "../../models/GroupModel";
import GroupUserModel from "../../models/GroupUserModel";
import UserModel from "../../models/UserModel";
import { db } from "../../utils/db";
import { exists } from "../../utils/validator";

//Fetch options
export const fetchOptions = {
    withRelated: ["group_users.user"],
    columns: ['*', db.raw('get_group_full_code(id) as full_code') as any]
}

//List
export const listSearch = ["name"];

export const listQuery = (queryBuilder: Knex.QueryBuilder<any, any>, req: Request) => {
    const groupId = req.query.group as string;
    if (groupId) queryBuilder.where("group_id", groupId);
    else queryBuilder.whereNull("group_id");
    return queryBuilder;
}

//Create
export const createOptions = {
    users: () => new UserModel()
        .where("user_type_id", 2)
        .fetchAll({columns: ["id", db.raw("CONCAT(first_name, ' ', last_name) AS name") as any]}),
}

//Insert and update
const checkCodeExistsInsert: CustomValidator = async (value, {req}) =>
    exists (
        GroupModel,
        "code",
        value, [],
        (queryBuilder) => {
            const groupId = req.body?.group_id;
            if (groupId === undefined) queryBuilder.whereNull("group_id");
            else queryBuilder.where("group_id", groupId);
            return queryBuilder;
        }
    );
    const checkCodeExistsUpdate: CustomValidator = async (value, {req}) =>
    exists (
        GroupModel,
        "code",
        value, [req.params?.id],
        async (queryBuilder) => {
            const id = req.params?.id;
            let groupId = (await new GroupModel({id: id}).fetch() as any).group_id;
            if (groupId === undefined) queryBuilder.whereNull("group_id");
            else queryBuilder.where("group_id", groupId);
            return queryBuilder;
        }
    );
const checkGroupIdExists: CustomValidator = (value) => Boolean(!value) || exists(GroupModel, "id", value);
export const insertRules = [
    body("code")
        .notEmpty().withMessage("Không được để trống")
        .not().custom(checkCodeExistsInsert).withMessage("Nhóm đã tồn tại"),
    body("name").notEmpty().withMessage("Không được để trống"),
    body("group_id").custom(checkGroupIdExists).withMessage("Mã nhóm không tồn tại"),
    body("group_ids").not().isArray().withMessage("Không phải kiểu mảng"),
];

export const updateRules = [
    body("code")
        .notEmpty().withMessage("Không được để trống")
        .not().custom(checkCodeExistsUpdate).withMessage("Mã nhóm đã tồn tại"),
    body("name").notEmpty().withMessage("Không được để trống"),
    body("group_ids").not().isArray().withMessage("Không phải kiểu mảng"),
];

export const insertFields = ["code", "name", "group_id"];
export const updateFields = ["code", "name"];

//Update
export const postInsert = async (data: any, req: Request) => {
    const groupId = data.id;
    if (req.body.user_ids) {
        const userIds = req.body.user_ids as number[];
        const rows = userIds.map(userId => ({group_id: groupId, user_id: userId}));
        await GroupUserModel.collection().add(rows).invokeThen('save');
    }
}

export const preUpdate = async (req: Request) => {
    const groupId = req.params.id;
    if (req.body.user_ids) {
        const userIds = req.body.user_ids as number[];
        const rows = userIds.map(userId => ({group_id: groupId, user_id: userId}));
        await new GroupUserModel().where("group_id", groupId).destroy({require: false});
        await GroupUserModel.collection().add(rows).invokeThen('save');
    }
}