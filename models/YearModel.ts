import Bookshelf from "bookshelf";
import { bookshelf } from "../utils/db";

export default class Year extends bookshelf!.Model<Year> {
    get tableName() {
        return "years";
    }
}