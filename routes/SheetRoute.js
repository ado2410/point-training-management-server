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

const rules = [
    check("name")
        .notEmpty().withMessage("Không được để trống"),
    check("semester_id")
        .notEmpty().withMessage("Không được để trống"),
];

const route = TemplateRoute(
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
            rules: rules,
            fields: ["name", "description", "semester_id"]
        },
        update: {
            rules: rules,
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

route.post("/:id/copy", asyncRoute(async (req, res) => {
    const sheet = (await new SheetModel({id: req.params.id}).fetch()).toJSON();

    let copiedSheet = (await new SheetModel().save({
        semester_id: req.body.semester_id,
        name: req.body.name,
    })).toJSON();

    copiedSheet = (await new SheetModel({id: copiedSheet.id}).fetch({withRelated: ["semester.year"]})).toJSON();

    await db.raw(`INSERT INTO title_activities (third_title_id, activity_id, sheet_id, point, options) SELECT third_title_id, activity_id, '${copiedSheet.id}', point, options FROM title_activities WHERE sheet_id = ${sheet.id}`);

    return res.json(copiedSheet);
}));

module.exports = route;