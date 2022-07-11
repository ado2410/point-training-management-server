import { check } from "express-validator";
import templateRoute from "./template/template.route";
import GroupModel from "../models/GroupModel";
import UserModel from "../models/UserModel";
import { db } from "../utils/db";
import GroupUserModel from "../models/GroupUserModel";
import { groupOptions } from "./Group.actions";

const rules = [
    check("code")
        .notEmpty().withMessage("Không được để trống"),
    check("name")
        .notEmpty().withMessage("Không được để trống"),
];

export default templateRoute(
    GroupModel,
    {
        fetchOptions: {
            withRelated: ["group_users.user"],
            columns: ['*', db.raw('get_group_full_code(id) as code') as any]
        },
        list: {
            query: (qb, req) => {
                const groupId = req.query.group as string;
                if (groupId) qb = qb.where("group_id", groupId);
                else qb = qb.whereNull("group_id");
                return qb;
            },
        },
        create: {
            options: {
                groups: () => groupOptions,
                users: () => new UserModel()
                    .where("user_type_id", 2)
                    .fetchAll({columns: ["id", db.raw("CONCAT(first_name, ' ', last_name) AS name") as any]}),
            }
        },
        insert: {
            rules: rules,
            fields: ["code", "name", "group_id"]
        },
        update: {
            rules: rules,
            fields: ["code", "name", "group_id"],
            pre: async (req) => {
                const groupId = req.params.id;
                const userIds = req.body.user_ids as number[];
                const rows = userIds.map(userId => ({group_id: groupId, user_id: userId}));
                await new GroupUserModel().where("group_id", groupId).destroy({require: false});
                await GroupUserModel.collection().add(rows).invokeThen('save');
            },
        }
    }
);