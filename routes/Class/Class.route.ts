import { check } from "express-validator";
import templateRoute from "../template/template.route";
import ClassModel from "../../models/ClassModel";
import MajorModel from "../../models/MajorModel";
import loginMiddleware from "../../middleware/loginMiddleware";
import adminMiddleware from "../../middleware/adminMiddleware";

const rules = [
    check("name").notEmpty().withMessage("Không được để trống"),
    check("major_id").notEmpty().withMessage("Không được để trống"),
];

export default templateRoute(ClassModel, {
    middleware: [loginMiddleware, adminMiddleware],
    fetchOptions: {
        withRelated: ["major.department"],
    },
    list: {
        query: (queryBuilder, req) => {
            const majorId = req.query.major as string;
            if (majorId) queryBuilder.where("major_id", majorId);
            return queryBuilder;
        },
    },
    create: {
        options: {
            majors: new MajorModel().fetchAll(),
        },
    },
    insert: {
        rules: rules,
        fields: ["name", "major_id"],
    },
    update: {
        rules: rules,
        fields: ["name", "major_id"],
    },
});