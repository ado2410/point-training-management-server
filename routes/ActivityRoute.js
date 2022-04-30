const TemplateRoute = require("./TemplateRoute");
const {check} = require("express-validator");
const Model = require("../models/ActivityModel");
const SemesterModel = require("../models/SemesterModel");
const ActivityTypeModel = require("../models/ActivityTypeModel");

const rules = [
    check("activity_type_id")
        .notEmpty().withMessage("Không được để trống"),
    check("code")
        .notEmpty().withMessage("Không được để trống"),
    check("name")
        .notEmpty().withMessage("Không được để trống"),
    check("time_start")
        .not().isDate().withMessage("Không phải kiểu ngày"),
    check("time_end")
        .not().isDate().withMessage("Không phải kiểu ngày"),
    check("host")
        .notEmpty().withMessage("Không được để trống"),
    check("type")
        .notEmpty().withMessage("Không được để trống")
        .isIn(["CHECK", "COUNT", "ENUM"]).withMessage("Không đúng kiểu")
        .not().isDate().withMessage("Không phải kiểu ngày"),
];

module.exports = TemplateRoute(
    Model,
    {
        list: {
            fetch: (req, res) => {
                return new Model().query((queryBuilder) => {
                    if (req.query.semester) {
                        if (req.query.type === "all") return queryBuilder.where('semester_id', req.query.semester).orWhereNull('semester_id');
                        else return queryBuilder.where('semester_id', req.query.semester);
                    }
                    else return queryBuilder.whereNull('semester_id');
                }).orderBy("created_at", "DESC").fetchAll({withRelated: ['activity_type']})
            },
        },
        create: {
            options: {
                semesters: async () => {
                    const options = [
                        {id: null, name: "Thường niên"},
                        ...await new SemesterModel().fetchAll(),
                    ];
                    return options;
                },
                activity_types: () => new ActivityTypeModel().fetchAll(),
            }
        },
        insert: {
            rules: rules,
            fields: ["semester_id", "activity_type_id", "code", "name", "time_start", "time_end", "address", "host", "description", "type", "accepts", "default_value"],
        },
        update: {
            rules: rules,
            fields: ["semester_id", "activity_type_id", "code", "name", "time_start", "time_end", "address", "host", "description", "type", "accepts", "default_value"],
        }
    }
);