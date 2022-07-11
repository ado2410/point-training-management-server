import SemesterModel from "../../models/SemesterModel";
import templateRoute from "../template/template.route";
import { createOptions, listQuery, rules } from "./Semester.constants";
import loginMiddleware from "../../middleware/loginMiddleware";
import adminMiddleware from "../../middleware/adminMiddleware";
import { copyAction, loadDataAction, saveDataAction, saveGeneralSettingAction, viewAction } from "./Semester.actions";

const route = templateRoute(SemesterModel, {
    middleware: [loginMiddleware],
    fetchOptions: {
        withRelated: ["year"],
    },
    list: {
        query: listQuery,
    },
    view: {
        custom: viewAction,
    },
    create: {
        options: createOptions,
    },
    insert: {
        rules: rules,
        fields: ["name", "year_id"],
    },
    update: {
        rules: rules,
        fields: ["name"],
    },
    extra: [
        {
            middleware: [loginMiddleware, adminMiddleware],
            path: "/:id/save_general_setting",
            method: "POST",
            action: saveGeneralSettingAction,
        },
        {
            middleware: [loginMiddleware, adminMiddleware],
            path: "/:id/copy",
            method: "POST",
            action: copyAction,
        },
        {
            middleware: [loginMiddleware, adminMiddleware],
            path: "/:id/save",
            method: "GET",
            action: saveDataAction,
        },
        {
            middleware: [loginMiddleware, adminMiddleware],
            path: "/:id/load",
            method: "POST",
            action: loadDataAction,
        },
    ],
});

export default route;