import Bookshelf from "bookshelf";
import { bookshelf } from "../utils/db";
import Major from "./MajorModel";

export default class Class extends bookshelf!.Model<Class> {
    get tableName() {
        return "classes";
    }
    major(): Major {
        return this.belongsTo(Major);
    }
}