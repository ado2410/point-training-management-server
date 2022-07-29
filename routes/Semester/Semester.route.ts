import SemesterModel from "../../models/SemesterModel";
import templateRoute from "../template/template.route";
import { copyAction, createOptions, fetchOptions, getDashboardAction, insertAndUpdateRules, listQuery, listSearch, loadDataAction, saveDataAction, saveGeneralSettingAction, viewAction } from "./Semester.constants";
import loginMiddleware from "../../middleware/loginMiddleware";
import adminMiddleware from "../../middleware/adminMiddleware";
import { semesterMiddleware } from "./Semester.middleware";

const route = templateRoute(SemesterModel, {
    middleware: [loginMiddleware],
    fetchOptions: fetchOptions,
    list: {
        search: listSearch,
        query: listQuery,
    },
    view: {
        middleware: [semesterMiddleware],
        custom: viewAction,
    },
    create: {
        options: createOptions,
    },
    insert: {
        middleware: [adminMiddleware],
        rules: insertAndUpdateRules,
        fields: ["name", "year_id"],
    },
    update: {
        middleware: [adminMiddleware],
        rules: insertAndUpdateRules,
        fields: ["name"],
    },
    delete: {
        middleware: [adminMiddleware],
    },
    extra: [
        {
            middleware: [semesterMiddleware],
            path: "/:id/dashboard",
            method: "GET",
            action: getDashboardAction,
        },
        {
            middleware: [adminMiddleware],
            path: "/:id/save_general_setting",
            method: "POST",
            action: saveGeneralSettingAction,
        },
        {
            middleware: [adminMiddleware],
            path: "/:id/copy",
            method: "POST",
            action: copyAction,
        },
        {
            middleware: [adminMiddleware],
            path: "/:id/save",
            method: "GET",
            action: saveDataAction,
        },
        {
            middleware: [adminMiddleware],
            path: "/:id/load",
            method: "POST",
            action: loadDataAction,
        },
    ],
});

export default route;