import Bookshelf from "bookshelf";
import { bookshelf } from "../utils/db";
import Year from "./YearModel";

export default class Semester extends bookshelf!.Model<Semester> {
    get tableName() {
        return "semesters";
    }
    year(): Year {
        return this.belongsTo(Year);
    }
}