import adminMiddleware from "../../middleware/adminMiddleware";
import loginMiddleware from "../../middleware/loginMiddleware";
import UserModel from "../../models/UserModel";
import TemplateRoute from "../template/template.route";
import { fetchOptions, insertFields, insertRules, listQuery, listSearch, updateFields, updateRules } from "./User.constants";
import { viewMiddleware } from "./User.middleware";

export default TemplateRoute(UserModel, {
    middleware: [loginMiddleware],
    fetchOptions: fetchOptions,
    list: {
        middleware: [adminMiddleware],
        search: listSearch,
        query: listQuery,
    },
    view: {
        middleware: [viewMiddleware],
    },
    insert: {
        middleware: [adminMiddleware],
        rules: insertRules,
        fields: insertFields,
    },
    update: {
        middleware: [adminMiddleware],
        rules: updateRules,
        fields: updateFields,
    },
    delete: {
        middleware: [adminMiddleware],
    }
});
