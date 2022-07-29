import { Request } from "express";
import { Knex } from "knex";
import ActivityModel from "../../models/ActivityModel";
import SemesterStudentModel from "../../models/SemesterStudentModel";
import StudentModel from "../../models/StudentModel";
import UserModel from "../../models/UserModel";
import { db } from "../../utils/db";
import { isAdmin, isImporter, isStudent, UserType } from "../User/User.constants";

export const getActivityCodeRawBuilder = (
    semesterId: string,
    activityId: string,
    as: string = "code"
) => db.raw(`get_activity_code(${semesterId}, ${activityId}) AS ${as}`) as any;

export const getCanModifyActivityRawBuilder = (auth: any, as: string = "can_modify") => {
    if (isAdmin(auth)) return db.raw(`true AS ${as}`);
    else if (isStudent(auth)) return db.raw(`false AS ${as}`);
    else return db.raw(`is_in_group(${auth.id}, activities.group_id) AS ${as}`);
};

export const getCanModifyAttendanceRawBuilder = (semesterId: string, auth: any, as:string = "can_modify_attendance") => {
    if (isAdmin(auth)) return db.raw(`true AS ${as}`);
    else if (isImporter(auth)) return getCanModifyActivityRawBuilder(auth, as);
    else return db.raw(`get_can_modify_attendance(${semesterId}, ${auth.student.id}, attendance) AS ${as}`);
};

/**
* Kiểm tra quyền chỉnh sửa activity:
* - Nếu là admin thì hoàn toàn được phép.
* - Nếu là importer chỉ được phép chỉnh sửa dữ liệu của họ.
* - Nếu là sinh viên thì không được phép.
*/
export const canModifyActivity = async (activityId: string, auth: any) => {
    if (isAdmin(auth)) return true;
    else if (isStudent(auth)) return false;
    else {
        const activity = await new ActivityModel({id: activityId})
            .query((queryBuilder) => queryBuilder.whereRaw(`group_id IN (SELECT group_id FROM group_users WHERE user_id = ${auth.id})`))
            .count();
        return activity > 0;
    }
};