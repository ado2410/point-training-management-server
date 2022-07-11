import Bookshelf from "bookshelf";
import { bookshelf } from "../utils/db";
import Group from "./GroupModel";
import Student from "./StudentModel";
import UserType from "./UserTypeModel";

export default class User extends bookshelf!.Model<User> {
    get tableName() {
        return "users";
    }
    get hidden() {
        return ["password"];
    }
    user_type(): UserType {
        return this.belongsTo(UserType);
    }
    user_group(): Group {
        return this.belongsTo(Group);
    }
    student(): Student {
        return this.hasOne(Student);
    }
}