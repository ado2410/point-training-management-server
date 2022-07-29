import adminMiddleware from "../../middleware/adminMiddleware";
import loginMiddleware from "../../middleware/loginMiddleware";
import ActivityModel from "../../models/ActivityModel";
import templateRoute from "../template/template.route";
import { createOptions, fetchOptions, getSemesterActivityAction, importFields, importRules, insertFields, insertRules, listQuery, listSearch, updateFields, updateRules } from "./Activity.constants";
import { canInsertActivityMiddleware, canModifyActivityMiddleware, semesterMiddleware } from "./Activity.middleware";

export default templateRoute(ActivityModel, {
    middleware: [loginMiddleware],
    fetchOptions: fetchOptions,
    list: {
        middleware: [semesterMiddleware],
        search: listSearch,
        query: listQuery,
    },
    create: {
        middleware: [canInsertActivityMiddleware],
        options: createOptions,
    },
    import: {
        middleware: [adminMiddleware],
        rules: importRules,
        fields: importFields,
    },
    insert: {
        middleware: [canInsertActivityMiddleware],
        rules: insertRules,
        fields: insertFields,
    },
    update: {
        middleware: [canModifyActivityMiddleware],
        rules: updateRules,
        fields: updateFields,
    },
    delete: {
        middleware: [canModifyActivityMiddleware],
    },
    extra: [
        {
            path: "/user",
            method: "GET",
            middleware: [semesterMiddleware],
            action: getSemesterActivityAction,
        }
    ],
});
