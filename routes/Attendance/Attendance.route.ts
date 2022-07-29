import loginMiddleware from "../../middleware/loginMiddleware";
import templateRoute from "../template/template.route";
import { getAttendanceAction, saveAttendanceAction, saveAttendanceRules } from "./Attendance.constants";
import { canModifyAttendanceMiddleware } from "./Attendance.middleware";

export default templateRoute(undefined, {
    extra: [
        {
            path: "/",
            method: "GET",
            middleware: [loginMiddleware],
            action: getAttendanceAction,
        },
        {
            path: "/",
            method: "POST",
            middleware: [loginMiddleware, canModifyAttendanceMiddleware],
            rules: saveAttendanceRules,
            action: saveAttendanceAction,
        },
    ],
});