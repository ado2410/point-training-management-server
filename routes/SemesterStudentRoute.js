const express = require("express");
const {asyncRoute} = require("../utils/route");
const StudentModel = require("../models/StudentModel");
const PrimaryTitleModel = require("../models/PrimaryTitleModel");
const ThirdTitleModel = require("../models/ThirdTitleModel");
const StudentActivityModel = require("../models/StudentActivityModel");
const MajorModel = require("../models/MajorModel");
const DepartmentModel = require("../models/DepartmentModel");
const SemesterStudentModel = require("../models/SemesterStudentModel");
const { db } = require("../utils/db");
const SemesterModel = require("../models/SemesterModel");
const route = express.Router({mergeParams: true});

route.get("/", asyncRoute(async (req, res) => {
    const semesterId = req.query.semester;

    let semester = (await new SemesterModel({id: semesterId}).fetch({withRelated: ['year']})).toJSON();

    if (req.query.student) {
        let data = (await new PrimaryTitleModel().orderBy("order").fetchAll({
            withRelated: [
                'secondary_titles.third_titles.title_activities.activity.student_activity',
                {
                    'secondary_titles': (qb) => qb.orderBy("order"),
                },
                {
                    'secondary_titles.third_titles': (qb) => qb.orderBy("order").select("*", db.raw(`calculate_point(${semesterId}, ${req.query.student}, third_titles.id) AS point`))
                },
                {
                    'secondary_titles.third_titles.title_activities': (qb) => qb.where('semester_id', semesterId),
                },
                {
                    'secondary_titles.third_titles.title_activities.activity.student_activity': (qb) => qb.where('student_id', req.query.student),
                },
            ]
        })).toJSON();
        let student = await new StudentModel({id: req.query.student}).fetch({withRelated: ['user', 'class.major.department']});
        return res.json({data: data, student: student, semester: semester});
    } else {
        let studentPoints = new StudentModel();
        if (req.query.class) studentPoints = studentPoints.where("class_id", req.query.class);
        studentPoints = await studentPoints.query(qb => {
            qb = qb.leftJoin("classes", "students.class_id", "classes.id")
            if (semester.settings?.keys?.length > 0)
                qb = qb.whereIn(db.raw("SUBSTRING(classes.name, 1, 3)"), semester.settings.keys);
            return qb;
        }).fetchAll({withRelated: ['user', 'class', 'semester_student']});
        return res.json({data: studentPoints});
    }
}));

route.post("/update", asyncRoute(async (req, res) => {
    const semesterId = req.query.semester;
    let semester = (await new SemesterModel({id: semesterId}).fetch({withRelated: ['year']})).toJSON();

    await db.raw(`
    INSERT INTO semester_students (semester_id, student_id, point)
    (
        SELECT ${semesterId}, students.id, (SELECT SUM(calculate_point(${semesterId}, students.id, third_titles.id)) FROM third_titles) AS point
        FROM students INNER JOIN classes ON classes.id = students.class_id
        WHERE SUBSTRING(classes.name, 1, 3) IN (${semester.settings?.keys ? "'" + semester.settings.keys.join("', '") + "'" : '' })
    )
    ON CONFLICT (semester_id, student_id)
    DO UPDATE SET point = EXCLUDED.point;
    `);

    return res.json({status: true});
}));

module.exports = route;