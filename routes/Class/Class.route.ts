import templateRoute from "../template/template.route";
import ClassModel from "../../models/ClassModel";
import loginMiddleware from "../../middleware/loginMiddleware";
import adminMiddleware from "../../middleware/adminMiddleware";
import { createOptions, fetchOptions, fields, listQuery, insertAndUpdateRules, listSearch } from "./Class.constants";

export default templateRoute(ClassModel, {
    middleware: [loginMiddleware],
    fetchOptions: fetchOptions,
    list: {
        search: listSearch,
        query: listQuery,
    },
    create: {
        middleware: [adminMiddleware],
        options: createOptions,
    },
    insert: {
        middleware: [adminMiddleware],
        rules: insertAndUpdateRules,
        fields: fields,
    },
    update: {
        middleware: [adminMiddleware],
        rules: insertAndUpdateRules,
        fields: fields,
    },
});