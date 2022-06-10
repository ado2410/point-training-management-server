const express = require("express");
const {asyncRoute} = require("../utils/route");
const StudentModel = require("../models/StudentModel");
const PrimaryTitleModel = require("../models/PrimaryTitleModel");
const ThirdTitleModel = require("../models/ThirdTitleModel");
const StudentActivityModel = require("../models/StudentActivityModel");
const MajorModel = require("../models/MajorModel");
const DepartmentModel = require("../models/DepartmentModel");
const SheetModel = require("../models/SheetModel");
const { db } = require("../utils/db");
const route = express.Router({mergeParams: true});

route.get("/", asyncRoute(async (req, res) => {

    if (req.query.student) {
        let data = (await new PrimaryTitleModel().orderBy("order").fetchAll({
            withRelated: [
                'secondary_titles.third_titles.title_activities.activity.student_activity',
                {
                    'secondary_titles': (qb) => qb.orderBy("order"),
                },
                {
                    'secondary_titles.third_titles': (qb) => qb.orderBy("order").select("*", db.raw(`calculate_point(${req.query.semester}, ${req.query.student}, third_titles.id) AS point`))
                },
                {
                    'secondary_titles.third_titles.title_activities': (qb) => qb.where('semester_id', req.query.semester),
                },
                {
                    'secondary_titles.third_titles.title_activities.activity.student_activity': (qb) => qb.where('student_id', req.query.student),
                },
            ]
        })).toJSON();
        let student = await new StudentModel({id: req.query.student}).fetch({withRelated: ['user', 'class.major.department']});

        return res.json({data: data, student: student});
    } else {
        let studentPoints = new StudentModel();
        if (req.query.class) studentPoints = studentPoints.where("class_id", req.query.class);
        studentPoints = await studentPoints.query(qb => qb.select("*", db.raw(`(SELECT SUM(calculate_point(${req.query.semester}, students.id, third_titles.id)) FROM third_titles) AS point`))).fetchAll({withRelated: ['user', 'class']});
        return res.json({data: studentPoints});
    }
}));

module.exports = route;