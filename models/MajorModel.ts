import Bookshelf from "bookshelf";
import { bookshelf } from "../utils/db";
import Class from "./ClassModel";
import Department from "./DepartmentModel";

export default class Major extends bookshelf!.Model<Major> {
    get tableName() {
        return "majors";
    }
    classes(): Bookshelf.Collection<Class> {
        return this.hasMany(Class);
    }
    department(): Department {
        return this.belongsTo(Department);
    }
}