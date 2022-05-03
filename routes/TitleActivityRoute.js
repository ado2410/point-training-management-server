const express = require("express");
const {asyncRoute} = require("../utils/route");
const PrimaryTitleModel = require("../models/PrimaryTitleModel");
const SecondaryTitleModel = require("../models/SecondaryTitleModel");
const ThirdTitleModel = require("../models/ThirdTitleModel");
const TitleActivityModel = require("../models/TitleActivityModel");
const ActivityModel = require("../models/ActivityModel");
const SheetModel = require("../models/SheetModel");
const TemplateRoute = require("./TemplateRoute");
const {check} = require("express-validator");
const route = express.Router({mergeParams: true});

const rules = [
    check("third_title_id")
        .notEmpty().withMessage("Không được để trống"),
    check("activity_id")
        .notEmpty().withMessage("Không được để trống"),
    check("sheet_id")
        .notEmpty().withMessage("Không được để trống"),
    check("point")
        .notEmpty().withMessage("Không được để trống"),
];

route.get("/", asyncRoute(async (req, res) => {
    let primaryTitles = await new PrimaryTitleModel()
        .orderBy("order", "ASC")
        .fetchAll({
        withRelated: [
            'secondary_titles.third_titles.title_activities.activity',
            {'secondary_titles': (qb) => qb.orderBy("order", "ASC")},
            {'secondary_titles.third_titles': (qb) => qb.orderBy("order", "ASC")},
            {'secondary_titles.third_titles.title_activities': (qb) => qb.where('sheet_id', req.query.sheet)},
        ],
    });
    let sheet = await new SheetModel().where({id: req.query.sheet}).fetch();
    return res.json({data: {
        primaryTitles: primaryTitles,
        sheet: sheet,
    }});
}));

route.post("/", asyncRoute(async (req, res) => {
    if (req.body.delete.length > 0) await new TitleActivityModel().where('id', 'IN', req.body.delete).destroy();

    const results = await Promise.all(req.body.title_activities.map(async (titleActivity) => {
        let result = null;
        if (titleActivity.id)
             result = await new TitleActivityModel({id: titleActivity.id}).save({
                point: titleActivity.point,
                options: titleActivity.options
            });
        else result = await new TitleActivityModel({
            third_title_id: titleActivity.third_title_id,
            activity_id: titleActivity.activity_id,
            sheet_id: titleActivity.sheet_id,
            point: titleActivity.point,
            options: titleActivity.options,
        }).save();
        const data = await new TitleActivityModel({id: result.id}).fetch({withRelated: ['activity']});
        return data;
    }));
    console.log(results);
    return res.json(results);
}));

module.exports = route;