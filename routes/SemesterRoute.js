const TemplateRoute = require("./TemplateRoute");
const {check} = require("express-validator");
const Model = require("../models/SemesterModel");
const YearModel = require("../models/YearModel");
const ActivityModel = require("../models/ActivityModel");
const StudentActivityModel = require("../models/StudentActivityModel");
const TitleActivityModel = require("../models/TitleActivityModel");
const { asyncRoute } = require("../utils/route");
const SemesterModel = require("../models/SemesterModel");
const { db } = require("../utils/db");
const { exists } = require("../utils/validator");
const fs = require('fs');

const rules = [
    check("name")
        .notEmpty().withMessage("Không được để trống")
        .isIn([1, 2]).withMessage("Sai học kỳ")
        .not().custom((value, {req}) => exists(Model, "name", value, [], (qb) => qb.where("year_id", req.body.year_id))).withMessage("Đã tồn tại trong CSDL"),
    check("year_id")
        .notEmpty().withMessage("Không được để trống"),
];

const handleSemester = (qb, semester) => {
    if (semester !== "null") return qb.where("semester_id", semester);
    else return qb.whereNull("semester_id");
}

const route = TemplateRoute(
    Model,
    {
        fetchOptions: {
            withRelated: ["year"],
        },
        list: {
            query: (qb, req) => {
                if (req.query.year)
                    qb  = qb.where("year_id", req.query.year);
                    return qb;
            },
        },
        view: {
            custom: async (req, res) => {
                const data = req.params.id !== 'null' ? (await new Model({id: req.params.id}).fetch({withRelated: ["year"]})).toJSON() : {year: {}, activities: []};
                const activities = {
                    type1: await new ActivityModel().where("activity_type_id", 1).where((qb) => handleSemester(qb, req.params.id)).count(),
                    type2: await new ActivityModel().where("activity_type_id", 2).where((qb) => handleSemester(qb, req.params.id)).count(),
                    type3: await new ActivityModel().where("activity_type_id", 3).where((qb) => handleSemester(qb, req.params.id)).count(),
                };
                data.activities = activities;
                return res.json(data);
            }
        },
        create: {
            options: {
                years: () => new YearModel().fetchAll(),
            }
        },
        insert: {
            rules: rules,
            fields: ["name", "year_id"],
        },
        update: {
            rules: rules,
            fields: ["name"]
        },
    }
);

route.post("/:id/copy", rules, asyncRoute(async (req, res) => {
    const semester = (await new SemesterModel({id: req.params.id}).fetch()).toJSON();

    //Generate new semester
    let newSemester = (await new SemesterModel().save({
        year_id: req.body.year_id,
        name: req.body.name,
    })).toJSON();
    newSemester = (await new SemesterModel({id: newSemester.id}).fetch({withRelated: ["year"]})).toJSON();

    //Copy all activities
    await db.raw(`INSERT INTO activities (semester_id, activity_type_id, code, name, time_start, time_end, address, host, description, type, accepts, default_value) SELECT ${newSemester.id}, activity_type_id, code, name, time_start, time_end, address, host, description, type, accepts, default_value FROM activities WHERE semester_id = ${semester.id}`);

    //Copy all title activities
    await db.raw(`
        INSERT INTO title_activities (activity_id, third_title_id, semester_id, point, options)
            SELECT (SELECT id FROM activities WHERE code = activities.code AND activities.semester_id = ${newSemester.id}) AS activity_id, third_title_id, ${newSemester.id}, point, options
            FROM title_activities JOIN activities ON title_activities.activity_id = activities.id
            WHERE title_activities.semester_id=${semester.id}
    `);

    return res.json(newSemester);
}));

route.get("/:id/save", asyncRoute(async (req, res) => {
    const fileData = 'SGVsbG8sIFdvcmxkIQ=='
    const fileName = 'data.txt'
    const fileType = 'text/plain'
    res.writeHead(200, {
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Type': fileType,
    });
    
    const semesterId = req.params.id;

    //Save activities
    const activities = await new ActivityModel().query(qb => qb.select("activity_type_id", "code", "name", "time_start", "time_end", "address", "host", "description", "type", "accepts", "default_value")).fetchAll();

    const studentActivities = await new StudentActivityModel().query(qb =>
        qb.join("activities", "activities.id", "student_activities.activity_id")
        .select("student_activities.student_id", "activities.code AS activity_code", "student_activities.value")
    ).fetchAll();

    //Save all title activities and student activities
    const titleActivities = await new TitleActivityModel()
        .query(qb =>
            qb.join("activities", "activities.id", "title_activities.activity_id")
            .select("third_title_id", "activities.code AS activity_code", "point", "options")
        )
        .where("title_activities.semester_id", semesterId)
        .fetchAll();
    
    let data = JSON.stringify({activities: activities, student_activities: studentActivities, title_activities: titleActivities}, null, 2);

    return res.end(data);
}));

route.post("/:id/load", asyncRoute(async (req, res) => {
    const semesterId = req.params.id;

    let activities = req.body.activities;
    let studentActivities = req.body.student_activities;
    let titleActivities = req.body.title_activities;

    activities = activities.map(activity => {
        activity.semester_id = semesterId;
        return activity;
    });
    const savedActivities = await db("activities").insert(activities).returning("*");

    studentActivities = studentActivities.map((studentActivity) => {
        activity = savedActivities.find(savedActivity => savedActivity.code === studentActivity.activity_code);
        studentActivity.activity_id = activity.id;
        delete studentActivity.activity_code;
        return studentActivity;
    });
    const savedStudentActivities = await db("student_activities").insert(studentActivities).returning("*");

    titleActivities = titleActivities.map((titleActivity) => {
        activity = savedActivities.find(savedActivity => savedActivity.code === titleActivity.activity_code);
        titleActivity.activity_id = activity.id;
        titleActivity.semester_id = semesterId;
        delete titleActivity.activity_code;
        return titleActivity;
    });
    const savedTitleActivities = await db("title_activities").insert(titleActivities).returning("*");

    return res.json({activities: savedActivities, titleActivities: savedTitleActivities, studentActivities: savedStudentActivities});
}));

module.exports = route;