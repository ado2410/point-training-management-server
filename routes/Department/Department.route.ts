import adminMiddleware from "../../middleware/adminMiddleware";
import loginMiddleware from "../../middleware/loginMiddleware";
import DepartmentModel from "../../models/DepartmentModel";
import templateRoute from "../template/template.route";
import { insertAndUpdateFields, insertAndUpdateRules, listSearch } from "./Department.constants";

export default templateRoute(DepartmentModel, {
    middleware: [loginMiddleware, adminMiddleware],
    list: {
        search: listSearch,
    },
    insert: {
        rules: insertAndUpdateRules,
        fields: insertAndUpdateFields,
    },
    update: {
        rules: insertAndUpdateRules,
        fields: insertAndUpdateFields,
    },
});