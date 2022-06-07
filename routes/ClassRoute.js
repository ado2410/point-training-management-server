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
        fetchOptions: {
            withRelated: ["major.department"],
        },
        list: {
            query: (qb, req) => {
                if (req.query.major)
                    qb  = qb.where("major_id", req.query.major);
                    return qb;
            },
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