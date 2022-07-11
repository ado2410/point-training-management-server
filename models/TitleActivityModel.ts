import Bookshelf from "bookshelf";
import { bookshelf } from "../utils/db";
import Activity from "./ActivityModel";

export default class TitleActivity extends bookshelf!.Model<TitleActivity> {
    get tableName() {
        return "title_activities";
    }
    activity(): Activity {
        return this.belongsTo(Activity);
    }
}