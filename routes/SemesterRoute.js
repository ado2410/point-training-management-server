const TemplateRoute = require("./TemplateRoute");
const {check} = require("express-validator");
const Model = require("../models/SemesterModel");
const YearModel = require("../models/YearModel");
const ActivityModel = require("../models/ActivityModel");
const SheetModel = require("../models/SheetModel");

const rules = [
    check("name")
        .notEmpty().withMessage("Không được để trống"),
];

module.exports = TemplateRoute(
    Model,
    {
        fetchOptions: {
            withRelated: ["year"],
        },
        list: {
            query: (qb, req) => {
                if (req.query.year)
                    qb  = qb.where("year_id", req.query.year);
                    return qb;
            },
        },
        view: {
            custom: async (req, res) => {
                const data = (await new Model({id: req.params.id}).fetch({withRelated: ["year"]})).toJSON();
                const activities = {
                    type1: await new ActivityModel().where("activity_type_id", 1).where("semester_id", req.params.id).count(),
                    type2: await new ActivityModel().where("activity_type_id", 2).where("semester_id", req.params.id).count(),
                    type3: await new ActivityModel().where("activity_type_id", 3).where("semester_id", req.params.id).count(),
                };
                data.activities = activities;
                data.sheets = await new SheetModel().where("semester_id", req.params.id).count();
                return res.json(data);
            }
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