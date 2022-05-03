const TemplateRoute = require("./TemplateRoute");
const {body} = require("express-validator");
const Model = require("../models/ActivityModel");
const SemesterModel = require("../models/SemesterModel");
const ActivityTypeModel = require("../models/ActivityTypeModel");
const {exists, duplicate} = require("../utils/validator");

const rules = (isImport = false) => ([
    body(`${isImport ? '*.' : ''}activity_type_id`)
        .notEmpty().withMessage("Không được để trống")
        .custom((value) => exists(ActivityTypeModel, value)).withMessage("Không tồn tại trong CSDL"),
    body(`${isImport ? '*.' : ''}code`)
        .notEmpty().withMessage("Không được để trống")
        .not().custom((value, {req}) => duplicate(value, "code", req.body)).withMessage("Bị trùng lặp")
        .not().custom((value, {req}) => exists(Model, value, "code", [req.params.id])).withMessage("Đã tồn tại trong CSDL"),
    body(`${isImport ? '*.' : ''}name`)
        .notEmpty().withMessage("Không được để trống"),
    body(`${isImport ? '*.' : ''}time_start`)
        .not().isDate().withMessage("Không phải kiểu ngày"),
    body(`${isImport ? '*.' : ''}time_end`)
        .not().isDate().withMessage("Không phải kiểu ngày"),
    body(`${isImport ? '*.' : ''}type`)
        .notEmpty().withMessage("Không được để trống")
        .isIn(["CHECK", "COUNT", "ENUM"]).withMessage("Không đúng kiểu")
        .not().isDate().withMessage("Không phải kiểu ngày"),
]);

module.exports = TemplateRoute(
    Model,
    {
        fetchOptions: {
            withRelated: ['activity_type'],
        },
        list: {
            fetch: (req, res) => {
                let query = new Model();
                if (req.query.activity_type) query = query.where("activity_type_id", req.query.activity_type);
                query = query.where((qb) => {
                    if (req.query.semester) {
                        if (req.query.type === "all") return qb.where('semester_id', req.query.semester).orWhereNull('semester_id');
                        else return qb.where('semester_id', req.query.semester);
                    }
                    else return qb.whereNull('semester_id');
                });

                return query.orderBy("created_at", "DESC").fetchAll({withRelated: ['activity_type']});
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
            rules: rules(),
            fields: ["semester_id", "activity_type_id", "code", "name", "time_start", "time_end", "address", "host", "description", "type", "accepts", "default_value"],
        },
        import: {
            rules: rules(true),
            fields: ["semester_id", "activity_type_id", "code", "name", "time_start", "time_end", "address", "host", "description", "type", "accepts", "default_value"],
        },
        update: {
            rules: rules(),
            fields: ["semester_id", "activity_type_id", "code", "name", "time_start", "time_end", "address", "host", "description", "type", "accepts", "default_value"],
        }
    }
);