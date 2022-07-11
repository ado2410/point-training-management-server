import { Request } from "express";
import { Knex } from "knex";
import ActivityModel from "../../models/ActivityModel";
import { db } from "../../utils/db";
import { UserType } from "../User/User.constants";

export const getActivityCodeBuilder = (
    semesterId: string,
    activityId: string,
    as: string = "code"
) => db.raw(`get_activity_code(${semesterId}, ${activityId}) AS ${as}`) as any;

export const getCanModifyActivityBuilder = (auth: any) => {
    if (auth.user_type_id === UserType.ADMIN) return db.raw("true AS can_modify");
    else if (auth.user_type_id === UserType.STUDENT) return db.raw("false AS can_modify");
    else return db.raw(`group_id IN (SELECT group_id FROM group_users WHERE user_id = ${auth.id}) AS can_modify`);
};

/*
Kiểm tra quyền chỉnh sửa dữ liệu
Nếu là importer chỉ được phép chỉnh sửa dữ liệu của họ
Nếu là sinh viên thì không được phép
*/
export const canModifyActivity = async (activityId: string, auth: any) => {
    if (auth.user_type_id === UserType.ADMIN) return true;
    else if (auth.user_type_id === UserType.STUDENT) return false;
    else {
        const activity = await new ActivityModel({id: activityId})
            .query((queryBuilder) => queryBuilder.whereRaw(`group_id IN (SELECT group_id FROM group_users WHERE user_id = ${auth.id})`))
            .count();
        return activity > 0;
    }
};