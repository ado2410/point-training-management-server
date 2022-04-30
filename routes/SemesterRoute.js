const TemplateRoute = require("./TemplateRoute");
const {check} = require("express-validator");
const Model = require("../models/SemesterModel");
const YearModel = require("../models/YearModel");

const rules = [
    check("name")
        .notEmpty().withMessage("Không được để trống"),
];

module.exports = TemplateRoute(
    Model,
    {
        list: {
            fetch: (req, res) => new Model().where("year_id", req.query.year).orderBy("created_at", "DESC").fetchAll(),
        },
        create: {
            options: {
                years: () => new YearModel().fetchAll(),
            }
        },
        insert: {
            rules: rules,
            fields: ["name", "department_id"]
        },
        update: {
            rules: rules,
            fields: ["name"]
        }
    }
);