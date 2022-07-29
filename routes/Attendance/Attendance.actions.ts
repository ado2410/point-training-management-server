import ActivityModel from "../../models/ActivityModel";
import StudentModel from "../../models/StudentModel";
import { db } from "../../utils/db";
import { canModifyActivity } from "../Activity/Activity.actions";
import { isAdmin, isImporter, UserType } from "../User/User.constants";

/**
* Kiểm tra quyền điểm danh:
* - Nếu là admin thì hoàn toàn được phép.
* - Nếu là importer chỉ được phép điểm danh activity của họ.
* - Nếu là sinh viên thì chỉ được phép điểm danh (cho lớp hoặc khoa) khi mở chỉnh sửa.
*/
export const canModifyAttendance = async (activityId: string, studentId: string, auth: any) => {
    if (isAdmin(auth)) return true;
    else if (isImporter(auth)) return canModifyActivity(activityId, auth);
    else {
        //Kiểm tra điểm danh sinh viên cùng một lớp hay không
        const studentCount = await new StudentModel().where({id: studentId, class_id: auth.student.class_id}).count();
        if (studentCount === 0) return false;
        
        return (await new ActivityModel({id: activityId}).query((queryBuilder) => queryBuilder.whereRaw(db.raw(`get_can_modify_attendance(semester_id, ${auth.student.id}, attendance) IS true`) as any)).count()) > 0;
    }
};