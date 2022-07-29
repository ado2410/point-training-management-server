import { Request, Response } from "express";
import { body } from "express-validator";
import PrimaryTitleModel from "../../models/PrimaryTitleModel";
import TitleActivityModel from "../../models/TitleActivityModel";
import { db } from "../../utils/db";

export const getTitleActivityAction = async (req: Request, res: Response) => {
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
}

export const updateTitleActivityRules = [
    body("third_title_id").notEmpty().withMessage("Không được để trống"),
    body("activity_id").notEmpty().withMessage("Không được để trống"),
    body("semester_id").notEmpty().withMessage("Không được để trống"),
    body("point").notEmpty().withMessage("Không được để trống"),
];

export const updateTitleActivityAction = async (req: Request, res: Response) => {
    if (req.body.delete.length > 0) await new TitleActivityModel().where('id', 'IN', req.body.delete).destroy({require: false});

    const results = await Promise.all(req.body.title_activities.map(async (titleActivity: any) => {
        let result: any = null;
        if (titleActivity.id) {
            result = await new TitleActivityModel({id: titleActivity.id}).save({
               point: titleActivity.point,
               options: titleActivity.options
           });
        }
        else {
            result = await new TitleActivityModel({
                third_title_id: titleActivity.third_title_id,
                activity_id: titleActivity.activity_id,
                semester_id: titleActivity.semester_id,
                point: titleActivity.point,
                options: titleActivity.options,
            }).save();
        }
        const data = await new TitleActivityModel({id: result.id})
            .fetch({withRelated: [
                {activity: (qb) => qb.select(["*", db.raw(`get_activity_code(semester_id, id) AS code`) as any])}
            ]});
        return data;
    }));
    return res.json(results);
}