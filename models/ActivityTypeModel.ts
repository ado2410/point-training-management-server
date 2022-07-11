import Bookshelf from "bookshelf";
import { bookshelf } from "../utils/db";

export default class ActivityType extends bookshelf!.Model<ActivityType> {
    get tableName() {
        return "activity_types";
    }
}