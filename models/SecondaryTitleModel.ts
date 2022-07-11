import Bookshelf from "bookshelf";
import { bookshelf } from "../utils/db";
import ThirdTitle from "./ThirdTitleModel";

export default class SecondaryTitle extends bookshelf!.Model<SecondaryTitle> {
    get tableName() {
        return "secondary_titles";
    }
    third_titles(): Bookshelf.Collection<ThirdTitle> {
        return this.hasMany(ThirdTitle);
    }
}