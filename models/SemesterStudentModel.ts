import Bookshelf from "bookshelf";
import { bookshelf } from "../utils/db";
import Semester from "./SemesterModel";

export default class SemesterStudent extends bookshelf!.Model<SemesterStudent> {
    get tableName() {
        return "semester_students";
    }
    semester(): Semester {
        return this.belongsTo(Semester);
    }
}