import { check } from "express-validator";
import PrimaryTitleModel from "../models/PrimaryTitleModel";
import TitleActivityModel from "../models/TitleActivityModel";
import { db } from "../utils/db";
import { asyncRoute } from "../utils/route";

const express = require("express");
const route = express.Router({mergeParams: true});

const rules = [
    check("third_title_id")
        .notEmpty().withMessage("Không được để trống"),
    check("activity_id")
        .notEmpty().withMessage("Không được để trống"),
    check("semester_id")
        .notEmpty().withMessage("Không được để trống"),
    check("point")
        .notEmpty().withMessage("Không được để trống"),
];

route.get("/", asyncRoute(async (req, res) => {
    const semesterId = req.query.semester as string;
    let primaryTitles = await new PrimaryTitleModel()
        .orderBy("order")
        .fetchAll({
        withRelated: [
            {'secondary_titles': (qb) => qb.orderBy("order")},
            {'secondary_titles.third_titles': (qb) => qb.orderBy("order")},
            {'secondary_titles.third_titles.title_activities': (qb) => qb.where('semester_id', semesterId)},
            {'secondary_titles.third_titles.title_activities.activity': (qb) => qb.column('*', db.raw(`get_activity_code(${semesterId}, id) AS code`))}
        ],
    });
    return res.json({data: {
        primary_titles: primaryTitles,
    }});
}));

route.post("/", asyncRoute(async (req, res) => {
    if (req.body.delete.length > 0) await new TitleActivityModel().where('id', 'IN', req.body.delete).destroy();

    const results = await Promise.all(req.body.title_activities.map(async (titleActivity: any) => {
        let result = null;
        if (titleActivity.id)
             result = await new TitleActivityModel({id: titleActivity.id}).save({
                point: titleActivity.point,
                options: titleActivity.options
            });
        else result = await new TitleActivityModel({
            third_title_id: titleActivity.third_title_id,
            activity_id: titleActivity.activity_id,
            semester_id: titleActivity.semester_id,
            point: titleActivity.point,
            options: titleActivity.options,
        }).save();
        const data = await new TitleActivityModel({id: result.id}).fetch({withRelated: ['activity']});
        return data;
    }));
    return res.json(results);
}));

export default route;