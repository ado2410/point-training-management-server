import { Request } from "express";
import { Knex } from "knex";
import GroupModel from "../../models/GroupModel";
import { db } from "../../utils/db";
import { isAdmin } from "../User/User.constants";

const fullName = db.raw("CONCAT('[', get_group_full_code(id), '] ', name) AS name");
const isInGroup = (auth: any) => {
    if (isAdmin(auth)) return db.raw("false AS disabled");
    else return db.raw(`is_in_group(${auth.id}, id) != true AS disabled`);
}

const getNestedChildren = (auth: any, nestedLimit: number) => {
    const children: Record<string, (queryBuilder: Knex.QueryBuilder<any, any>) => Knex.QueryBuilder<any, any>>[] = [];
    let related = 'children';
    for (let i = 0; i < nestedLimit; i++) {
        children.push({[related]: (qb) => qb.column('id', fullName, 'group_id', isInGroup(auth))});
        related = related + '.children';
    }
    return children;
}

export const groupOptions = (req: Request) => {
    const auth = req.headers.auth as any;
    return new GroupModel()
        .query(qb => qb.whereNull("group_id"))
        .fetchAll({
            columns: ['id', fullName as any, isInGroup(auth)],
            withRelated: getNestedChildren(auth, 10) as any
        });
};