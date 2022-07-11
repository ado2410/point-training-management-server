import Bookshelf from "bookshelf";
import { bookshelf } from "../utils/db";
import GroupUser from "./GroupUserModel";

export default class Group extends bookshelf!.Model<Group> {
    get tableName() {
        return "groups";
    }
    children(): Bookshelf.Collection<Group> {
        return this.hasMany(Group);
    }
    parent(): Group {
        return this.belongsTo(Group);
    }
    group_users(): Bookshelf.Collection<GroupUser> {
        return this.hasMany(GroupUser);
    }
}