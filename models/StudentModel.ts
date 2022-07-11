import Bookshelf from "bookshelf";
import { bookshelf } from "../utils/db";
import Class from "./ClassModel";
import SemesterStudent from "./SemesterStudentModel";
import StudentActivity from "./StudentActivityModel";
import User from "./UserModel";

export default class Student extends bookshelf!.Model<Student> {
    get tableName() {
        return "students";
    }
    user(): User {
        return this.belongsTo(User);
    }
    class(): Class {
        return this.belongsTo(Class);
    }
    student_activities(): Bookshelf.Collection<StudentActivity> {
        return this.hasMany(StudentActivity);
    }
    semester_student(): SemesterStudent {
        return this.hasOne(SemesterStudent);
    }
}