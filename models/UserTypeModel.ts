import Bookshelf from "bookshelf";
import { bookshelf } from "../utils/db";
import User from "./UserModel";

export default class UserType extends bookshelf!.Model<UserType> {
    get tableName() {
        return "users";
    }
    users(): Bookshelf.Collection<User> {
        return this.hasMany(User);
    }
}