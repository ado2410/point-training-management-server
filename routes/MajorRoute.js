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
        fetchOptions: {
            withRelated: ["department"],
        },
        list: {
            query: (qb, req) => {
                if (req.query.department) qb = model.where("department_id", req.query.department)
                return qb;
            },
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