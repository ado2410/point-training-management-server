import { Request } from "express";
import { Knex } from "knex";
import loginMiddleware from "../../middleware/loginMiddleware";
import ActivityModel from "../../models/ActivityModel";
import ClassModel from "../../models/ClassModel";
import DepartmentModel from "../../models/DepartmentModel";
import { groupOptions } from "../Group.actions";
import templateRoute from "../template/template.route";
import { getActivityCodeBuilder, getCanModifyActivityBuilder } from "./Activity.actions";
import { activityImportRules, activityRules } from "./Activity.constants";
import { canInsertActivityMiddleware, canModifyActivityMiddleware } from "./Activity.middleware";

const fetchOptions = async (req: Request) => {
    const auth = req.headers.auth as any;
    let semesterId = (req.query.semester || req.body.semester_id) as string;
    //Nếu không tìm thấy trên params hoặc body
    if (!semesterId) {
        const activityId = req.params.id;
        if (activityId) {
            const activity = (
                await new ActivityModel(activityId).fetch()
            ).toJSON();
            semesterId = activity.semester_id;
        }
    }
    return {
        columns: ["*", getActivityCodeBuilder(semesterId, "id"), getCanModifyActivityBuilder(auth)],
        withRelated: ["activity_type", "semester.year"],
    };
};

const listSearch = (req: Request) => [
    getActivityCodeBuilder(req.query.semesterId as string, "id"),
    "name",
    "address",
    "host",
    "description",
];

const listQuery = (queryBuilder: Knex.QueryBuilder<any, any>, req: Request) => {
    const semesterId = req.query.semester as string;
    const activityTypeId = req.query.activity_type as string;

    queryBuilder.where("semester_id", semesterId);
    if (activityTypeId) queryBuilder.where("activity_type_id", activityTypeId);
    return queryBuilder;
};

const createOptions = {
    departments: new DepartmentModel().fetchAll(),
    classes: new ClassModel().fetchAll(),
    groups: groupOptions,
};

export default templateRoute(ActivityModel, {
    middleware: [loginMiddleware],
    fetchOptions: fetchOptions,
    list: {
        search: listSearch,
        query: listQuery,
    },
    create: {
        options: createOptions,
    },
    import: {
        rules: activityImportRules,
        fields: [
            "semester_id",
            "activity_type_id",
            "group_id",
            "name",
            "time_start",
            "time_end",
            "address",
            "host",
            "description",
            "type",
            "accepts",
            "default_value",
        ],
    },
    insert: {
        middleware: [canInsertActivityMiddleware],
        rules: activityRules,
        fields: [
            "semester_id",
            "activity_type_id",
            "group_id",
            "name",
            "time_start",
            "time_end",
            "address",
            "host",
            "description",
            "type",
            "accepts",
            "default_value",
            "attendance",
        ],
    },
    update: {
        middleware: [canModifyActivityMiddleware],
        rules: activityRules,
        fields: [
            "group_id",
            "name",
            "time_start",
            "time_end",
            "address",
            "host",
            "description",
            "type",
            "accepts",
            "default_value",
            "attendance",
        ],
    },
    delete: {
        middleware: [canModifyActivityMiddleware],
    }
});
