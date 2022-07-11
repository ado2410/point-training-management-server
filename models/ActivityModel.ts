import Bookshelf from "bookshelf";
import { bookshelf } from "../utils/db";
import ActivityType from "./ActivityTypeModel";
import Group from "./GroupModel";
import Semester from "./SemesterModel";
import StudentActivity from "./StudentActivityModel";

export default class Activity extends bookshelf!.Model<Activity> {
    get tableName() {
        return "activities";
    }
    activity_type(): ActivityType {
        return this.belongsTo(ActivityType);
    }
    student_activities(): Bookshelf.Collection<StudentActivity> {
        return this.hasMany(StudentActivity);
    }
    student_activity(): StudentActivity {
        return this.hasOne(StudentActivity);
    }
    semester(): Semester {
        return this.belongsTo(Semester);
    }
    group(): Group {
        return this.belongsTo(Group);
    }
}