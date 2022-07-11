import { Knex } from "knex";
import GroupModel from "../models/GroupModel";
import { db } from "../utils/db";

const fullName = db.raw("CONCAT('[', get_group_full_code(id), '] ', name) as name");

const getNestedChildren = (nestedLimit: number) => {
    const children: Record<string, (queryBuilder: Knex.QueryBuilder<any, any>) => Knex.QueryBuilder<any, any>>[] = [];
    let related = 'children';
    for (let i = 0; i < nestedLimit; i++) {
        children.push({[related]: (qb) => qb.column('id', fullName, 'group_id')});
        related = related + '.children';
    }
    return children;
}

export const groupOptions = (
    new GroupModel()
        .query(qb => qb.whereNull("group_id"))
        .fetchAll({
            columns: ['id', fullName as any],
            withRelated: getNestedChildren(10) as any
        })
);