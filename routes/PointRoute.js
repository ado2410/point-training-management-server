const express = require("express");
const {asyncRoute} = require("../utils/route");
const StudentModel = require("../models/StudentModel");
const PrimaryTitleModel = require("../models/PrimaryTitleModel");
const ThirdTitleModel = require("../models/ThirdTitleModel");
const StudentActivityModel = require("../models/StudentActivityModel");
const MajorModel = require("../models/MajorModel");
const DepartmentModel = require("../models/DepartmentModel");
const SheetModel = require("../models/SheetModel");
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
        let student = await new StudentModel({id: req.query.student}).fetch({withRelated: ['user', 'class.major.department']});
        let sheet = await new SheetModel({id: req.query.sheet}).fetch({withRelated: ['semester.year']});
        return res.json({data: data, student: student, sheet: sheet});
    } else {
        let data = await new PrimaryTitleModel().fetchAll({
            withRelated: [
                'secondary_titles.third_titles.title_activities.activity.student_activities',
                {
                    'secondary_titles.third_titles.title_activities': (qb) => qb.where('sheet_id', req.query.sheet),
                },
            ]
        });
        let students = new StudentModel();
        if (req.query.class)
            students = students.where("class_id", req.query.class);
        students = await students.fetchAll({withRelated: ['user', 'class']});
        return res.json({data: data, students: students});
    }
}));

module.exports = route;