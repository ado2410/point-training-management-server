import Bookshelf from "bookshelf";
import { bookshelf } from "../utils/db";
import SemesterStudent from "./SemesterStudentModel";
import Year from "./YearModel";

export default class Semester extends bookshelf!.Model<Semester> {
    get tableName() {
        return "semesters";
    }
    year(): Year {
        return this.belongsTo(Year);
    }
    semester_students(): Bookshelf.Collection<SemesterStudent> {
        return this.hasMany(SemesterStudent)
    }
}