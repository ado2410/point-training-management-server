import { bookshelf } from "../utils/db";
import Group from "./GroupModel";
import User from "./UserModel";

export default class GroupUser extends bookshelf!.Model<GroupUser> {
    get tableName() {
        return "group_users";
    }
    group(): Group {
        return this.belongsTo(Group);
    }
    user(): User {
        return this.belongsTo(User);
    }
}