const TemplateRoute = require("./TemplateRoute");
const {check} = require("express-validator");
const Model = require("../models/SheetModel");
const SemesterModel = require("../models/SemesterModel");
const TitleActivityModel = require("../models/TitleActivityModel");
const YearModel = require("../models/YearModel");

const rules = [
    check("name")
        .notEmpty().withMessage("Không được để trống"),
    check("semester_id")
        .notEmpty().withMessage("Không được để trống"),
];

module.exports = TemplateRoute(
    Model,
    {
        fetchOptions: {
            withRelated: ["semester.year"],
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
                await new TitleActivityModel().where("sheet_id", sheet.id).destroy();
                await new Model({id: req.params.id}).destroy();
                return res.json(sheet);
            }
        }
    }
);