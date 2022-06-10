const TemplateRoute = require("./TemplateRoute");
const {check} = require("express-validator");
const Model = require("../models/SheetModel");
const SemesterModel = require("../models/SemesterModel");
const TitleActivityModel = require("../models/TitleActivityModel");
const YearModel = require("../models/YearModel");
const SheetModel = require("../models/SheetModel");
const knex = require("knex");
const { db } = require("../utils/db");
const { asyncRoute } = require("../utils/route");

const createRules = [
    check("name")
        .notEmpty().withMessage("Không được để trống"),
    check("semester_id")
        .notEmpty().withMessage("Không được để trống"),
];

const editRules = [
    check("name")
        .notEmpty().withMessage("Không được để trống"),
];

module.exports = TemplateRoute(
    Model,
    {
        fetchOptions: {
            withRelated: ["semester.year"],
        },
        list: {
            query: (qb, req) => {
                if (req.query.semester) qb.where("semester_id", req.query.semester);
                return qb;
            },
        },
        create: {
            options: {
                semesters: () => new SemesterModel().fetchAll({withRelated: ["year"]}),
            }
        },
        insert: {
            rules: createRules,
            fields: ["name", "description", "semester_id"]
        },
        update: {
            rules:editRules,
            fields: ["name", "description"]
        },
        delete: {
            custom: async (req, res) => {
                const sheet = (await new Model({id: req.params.id}).fetch()).toJSON();
                await new TitleActivityModel().where("sheet_id", sheet.id).destroy({require: false});
                await new Model({id: req.params.id}).destroy();
                return res.json(sheet);
            }
        }
    }
);