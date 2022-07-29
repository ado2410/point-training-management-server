import adminMiddleware from "../../middleware/adminMiddleware";
import loginMiddleware from "../../middleware/loginMiddleware";
import SemesterStudentModel from "../../models/SemesterStudentModel";
import { db } from "../../utils/db";
import templateRoute from "../template/template.route";
import { getSemesterStudentAction, listAction, syncAction, updateFields, updateRules, viewPointAction } from "./SemesterStudent.constants";
import { getSemesterStudentMiddleware, listMiddleware, semesterMiddleware } from "./SemesterStudent.middleware";

export default templateRoute(SemesterStudentModel, {
    middleware: [loginMiddleware],
    list: {
        middleware: [listMiddleware, semesterMiddleware],
        search: [db.raw("CONCAT(students.first_name, ' ', students.last_name)") as any],
        custom: listAction,
    },
    view: {
        excluded: true,
    },
    update: {
        middleware: [adminMiddleware],
        rules: updateRules,
        fields: updateFields,
    },
    extra: [
        {
            middleware: [semesterMiddleware],
            path: "/point",
            method: "GET",
            action: viewPointAction,
        },
        {
            path: "/sync",
            method: "POST",
            action: syncAction,
        },
        {
            path: "/student/:studentId",
            method: "GET",
            middleware: [getSemesterStudentMiddleware],
            action: getSemesterStudentAction,
        }
    ],
});