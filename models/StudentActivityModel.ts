import Bookshelf from "bookshelf";
import { bookshelf } from "../utils/db";
import Activity from "./ActivityModel";

export default class StudentActivity extends bookshelf!.Model<StudentActivity> {
    get tableName() {
        return "student_activities";
    }
    activity(): Activity {
        return this.belongsTo(Activity);
    }
}