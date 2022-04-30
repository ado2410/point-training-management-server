const TemplateRoute = require("./TemplateRoute");
const {check} = require("express-validator");
const Model = require("../models/ClassModel");
const MajorModel = require("../models/MajorModel");

const rules = [
    check("name")
        .notEmpty().withMessage("Không được để trống"),
];

module.exports = TemplateRoute(
    Model,
    {
        list: {
            key: "classes",
            fetch: (req, res) => new Model().where("major_id", req.query.major).orderBy("created_at", "DESC").fetchAll(),
        },
        create: {
            options: {
                majors: () => new MajorModel().fetchAll(),
            }
        },
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