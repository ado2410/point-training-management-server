import ActivityModel from "../../models/ActivityModel";
import { db } from "../../utils/db";
import { isAdmin, isImporter, isStudent } from "../User/User.constants";

/**
 * Trả về sql để lấy mã hoạt động
 * SELECT get_activity_code(id học kỳ, id hoạt động) AS tên
 */
export const getActivityCodeRawBuilder = (
    semesterId: string,
    activityId: string,
    as: string = "code"
) => db.raw(`get_activity_code(${semesterId}, ${activityId}) AS ${as}`) as any;

/**
 * Trả về sql giá trị true hoặc false nếu người dùng đang đăng nhập có quyền chỉnh sửa hoạt động hay không
 * Nếu là admin thì hoàn toàn có quyền
 * Nếu là là người nhập liệu thì chỉ quyền giới hạn cho các hoạt động mà họ có thể quản lý
 * Nếu là sinh viên thì không được phép
 */
export const getCanModifyActivityRawBuilder = (auth: any, as: string = "can_modify") => {
    if (isAdmin(auth)) return db.raw(`true AS ${as}`);
    else if (isStudent(auth)) return db.raw(`false AS ${as}`);
    else return db.raw(`is_in_group(${auth.id}, activities.group_id) AS ${as}`);
};

/**
 * Trả về sql giá trị true hoặc false nếu người dùng đang đăng nhập có quyền đánh giá hoạt động
 * Nếu là admin thì hoàn toàn có quyền
 * Nếu là là người nhập liệu thì chỉ quyền giới hạn cho các hoạt động mà họ có thể quản lý
 * Nếu là sinh viên thì chỉ được phép khi có mở cho phép đánh giá
 */
export const getCanModifyAttendanceRawBuilder = (semesterId: string, auth: any, as:string = "can_modify_attendance") => {
    if (isAdmin(auth)) return db.raw(`true AS ${as}`);
    else if (isImporter(auth)) return getCanModifyActivityRawBuilder(auth, as);
    else return db.raw(`get_can_modify_attendance(${semesterId}, ${auth.student.id}, attendance) AS ${as}`);
};

/**
* Kiểm tra quyền chỉnh sửa hoạt động:
* - Nếu là admin thì hoàn toàn được phép.
* - Nếu là người nhập liệu chỉ được phép chỉnh sửa dữ liệu của họ.
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