const express = require("express");
const {asyncRoute} = require("../utils/route");
const StudentModel = require("../models/StudentModel");
const PrimaryTitleModel = require("../models/PrimaryTitleModel");
const ThirdTitleModel = require("../models/ThirdTitleModel");
const StudentActivityModel = require("../models/StudentActivityModel");
const route = express.Router({mergeParams: true});

route.get("/", asyncRoute(async (req, res) => {

    if (req.query.student) {
        let data = await new PrimaryTitleModel().fetchAll({
            withRelated: [
                'secondary_titles.third_titles.title_activities.activity.student_activity',
                {
                    'secondary_titles.third_titles.title_activities': (qb) => qb.where('sheet_id', req.query.sheet),
                },
                {
                    'secondary_titles.third_titles.title_activities.activity.student_activity': (qb) => qb.where('student_id', req.query.student),
                },
            ]
        });
        return res.json({data: data});
    } else {
        let data = await new PrimaryTitleModel().fetchAll({
            withRelated: [
                'secondary_titles.third_titles.title_activities.activity.student_activities',
                {
                    'secondary_titles.third_titles.title_activities': (qb) => qb.where('sheet_id', req.query.sheet),
                },
            ]
        });
        let students = await new StudentModel().fetchAll({withRelated: ['user', 'class']});
        return res.json({data: data, students: students});
    }
}));

module.exports = route;