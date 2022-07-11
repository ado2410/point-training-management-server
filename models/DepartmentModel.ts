import Bookshelf from "bookshelf";
import { bookshelf } from "../utils/db";
import Major from "./MajorModel";

export default class Department extends bookshelf!.Model<Department> {
    get tableName() {
        return "departments";
    }
    majors(): Bookshelf.Collection<Major> {
        return this.hasMany(Major);
    }
}