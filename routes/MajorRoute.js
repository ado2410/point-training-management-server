const TemplateRoute = require("./TemplateRoute");
const {check} = require("express-validator");
const Model = require("../models/MajorModel");
const DepartmentModel = require("../models/DepartmentModel");

const rules = [
    check("name")
        .notEmpty().withMessage("Không được để trống"),
];

module.exports = TemplateRoute(
    Model,
    {
        list: {
            fetch: (req, res) => new Model().where("department_id", req.query.department).orderBy("created_at", "DESC").fetchAll(),
        },
        create: {
            options: {
                departments: () => new DepartmentModel().fetchAll(),
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