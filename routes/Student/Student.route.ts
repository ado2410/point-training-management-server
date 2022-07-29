import adminMiddleware from "../../middleware/adminMiddleware";
import loginMiddleware from "../../middleware/loginMiddleware";
import StudentModel from "../../models/StudentModel";
import templateRoute from "../template/template.route";
import { createOptions, deleteAction, fetchOptions, importAction, importRules, insertAction, insertAndUpdateRules, listQuery, listSearch, updateAction } from "./Student.constants";
import { viewAndUpdateMiddleware } from "./Student.middleware";

export default templateRoute(StudentModel, {
    middleware: [loginMiddleware],
    fetchOptions: fetchOptions,
    list: {
        middleware: [adminMiddleware],
        search: listSearch,
        query: listQuery,
    },
    create: {
        middleware: [adminMiddleware],
        options: createOptions,
    },
    view: {
        middleware: [viewAndUpdateMiddleware],
    },
    import: {
        middleware: [adminMiddleware],
        rules: importRules,
        custom: importAction,
    },
    insert: {
        middleware: [adminMiddleware],
        rules: insertAndUpdateRules,
        custom: insertAction,
    },
    update: {
        middleware: [viewAndUpdateMiddleware],
        rules: insertAndUpdateRules,
        custom: updateAction,
    },
    delete: {
        middleware: [adminMiddleware],
        custom: deleteAction,
    },
});