const TemplateRoute = require("./TemplateRoute");
const {check} = require("express-validator");
const Model = require("../models/SheetModel");
const SemesterModel = require("../models/SemesterModel");
const YearModel = require("../models/YearModel");

const rules = [
    check("name")
        .notEmpty().withMessage("Không được để trống"),
    check("semester_id")
        .notEmpty().withMessage("Không được để trống"),
];

module.exports = TemplateRoute(
    Model,
    {
        fetchOptions: {
            withRelated: ["semester.year"],
        },
        create: {
            options: {
                semesters: () => new SemesterModel().fetchAll({withRelated: ["year"]}),
            }
        },
        insert: {
            rules: rules,
            fields: ["name", "description", "semester_id"]
        },
        update: {
            rules: rules,
            fields: ["name", "description"]
        }
    }
);