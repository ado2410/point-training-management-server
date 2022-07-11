import Bookshelf from "bookshelf";
import { bookshelf } from "../utils/db";
import TitleActivity from "./TitleActivityModel";

export default class ThirdTitle extends bookshelf!.Model<ThirdTitle> {
    get tableName() {
        return "third_titles";
    }
    title_activities(): Bookshelf.Collection<TitleActivity> {
        return this.hasMany(TitleActivity);
    }
}