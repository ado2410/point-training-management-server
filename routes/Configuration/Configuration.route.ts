import adminMiddleware from "../../middleware/adminMiddleware";
import loginMiddleware from "../../middleware/loginMiddleware";
import templateRoute from "../template/template.route";
import { getTitleActivityAction, updateTitleActivityAction, updateTitleActivityRules } from "./Configuration.constants";

export default templateRoute(undefined, {
    middleware: [loginMiddleware],
    extra: [
        {
            path: "/",
            method: "GET",
            action: getTitleActivityAction,
        },
        {
            path: "/",
            method: "POST",
            middleware: [adminMiddleware],
            rules: updateTitleActivityRules,
            action: updateTitleActivityAction,
        },
    ],
});