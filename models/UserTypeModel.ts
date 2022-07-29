import Bookshelf from "bookshelf";
import { bookshelf } from "../utils/db";
import User from "./UserModel";

export default class UserType extends bookshelf!.Model<UserType> {
    get tableName() {
        return "user_types";
    }
    users(): Bookshelf.Collection<User> {
        return this.hasMany(User);
    }
}