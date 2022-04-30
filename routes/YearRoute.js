const TemplateRoute = require("./TemplateRoute");
const {check} = require("express-validator");
const Model = require("../models/YearModel");

const rules = [
    check("name")
        .notEmpty().withMessage("Không được để trống"),
];

module.exports = TemplateRoute(
    Model,
    {
        insert: {
            rules: rules,
            fields: ["name"]
        },
        update: {
            rules: rules,
            fields: ["name"]
        }
    }
);