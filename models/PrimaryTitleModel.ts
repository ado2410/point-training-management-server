import Bookshelf from "bookshelf";
import { bookshelf } from "../utils/db";
import SecondaryTitle from "./SecondaryTitleModel";

export default class PrimaryTitle extends bookshelf!.Model<PrimaryTitle> {
    get tableName() {
        return "primary_titles";
    }
    secondary_titles(): Bookshelf.Collection<SecondaryTitle> {
        return this.hasMany(SecondaryTitle);
    }
}