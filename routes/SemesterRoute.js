const TemplateRoute = require("./TemplateRoute");
const {check} = require("express-validator");
const Model = require("../models/SemesterModel");
const YearModel = require("../models/YearModel");
const StudentModel = require("../models/StudentModel");
const ClassModel = require("../models/ClassModel");
const UserModel = require("../models/UserModel");
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
                const semesterId = req.params.id;
                const semester = (await new Model({id: semesterId}).fetch({withRelated: ["year"]})).toJSON();
                const studentCount = await new StudentModel()
                    .query(qb => {
                        qb = qb.leftJoin("classes", "students.class_id", "classes.id");
                        if (semester.settings?.keys?.length > 0)
                            qb = qb.whereIn(db.raw("SUBSTRING(classes.name, 1, 3)"), semester.settings.keys)
                        return qb;
                    })
                    .count();
                const activityCount = {
                    type1: await new ActivityModel().where("activity_type_id", 1).where((qb) => handleSemester(qb, semesterId)).count(),
                    type2: await new ActivityModel().where("activity_type_id", 2).where((qb) => handleSemester(qb, semesterId)).count(),
                    type3: await new ActivityModel().where("activity_type_id", 3).where((qb) => handleSemester(qb, semesterId)).count(),
                };
                semester.activityCount = activityCount;
                semester.studentCount = studentCount;

                return res.json(semester);
            }
        },
        create: {
            options: {
                years: () => new YearModel().fetchAll(),
                keys: () => new ClassModel().query(qb => qb.select(db.raw("DISTINCT SUBSTRING(classes.name, 1, 3) AS id"), db.raw("CONCAT('Khóa ', SUBSTRING(classes.name, 1, 3)) AS name")).orderBy("id", "DESC")).fetchAll(),
                editors: () => new UserModel().where("user_type_id", 2).query(qb => qb.select("id", db.raw("CONCAT(username, ' - ', first_name, ' ', last_name) AS name"))).fetchAll(),
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

route.post("/:id/save_general_setting", asyncRoute(async (req, res) => {
    const semesterId = req.params.id;
    const settings = req.body;

    await new Model({id: semesterId}).save({settings: settings});
    const semester = await new Model({id: semesterId}).fetch();

    return res.json(semester);
}));

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
            SELECT (SELECT id FROM activities WHERE code=ac.code AND activities.semester_id=${newSemester.id}) AS activity_id, third_title_id, ${newSemester.id}, point, options
            FROM title_activities JOIN activities AS ac ON title_activities.activity_id = ac.id
            WHERE title_activities.semester_id=${semester.id}
    `);

    return res.json(newSemester);
}));

route.get("/:id/save", asyncRoute(async (req, res) => {
    const semesterId = req.params.id;
    const fileData = 'SGVsbG8sIFdvcmxkIQ=='
    const fileName = `data_semesterID-${semesterId}.json`
    const fileType = 'text/plain'
    res.writeHead(200, {
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Type': fileType,
    });

    //Save semester setting
    const semester = (await new Model({id: semesterId}).query(qb => qb.select("settings")).fetch()).toJSON();
    delete semester.id;

    //Save activities
    let activities = [];
    if (!req.query.type || req.query.type === 'activity') {
        activities = await new ActivityModel().query(qb => qb.select("activity_type_id", "code", "name", "time_start", "time_end", "address", "host", "description", "type", "accepts", "default_value")).fetchAll();
    }

    //Save all title activities
    let studentActivities = [];
    if (!req.query.type || req.query.type === 'student_activity') {
        studentActivities = await new StudentActivityModel().query(qb =>
            qb.join("activities", "activities.id", "student_activities.activity_id")
            .select("student_activities.student_id", "activities.code AS activity_code", "student_activities.value")
        ).fetchAll();
    }

    //Save all title activities
    let titleActivities  = [];
    if (!req.query.type || req.query.type === 'title_activity') {
        titleActivities = await new TitleActivityModel()
            .query(qb =>
                qb.join("activities", "activities.id", "title_activities.activity_id")
                .select("third_title_id", "activities.code AS activity_code", "point", "options")
            )
            .where("title_activities.semester_id", semesterId)
            .fetchAll();
    }
    
    let data = JSON.stringify({semester: semester, activities: activities, student_activities: studentActivities, title_activities: titleActivities}, null, 2);

    return res.end(data);
}));

route.post("/:id/load", asyncRoute(async (req, res) => {
    const semesterId = req.params.id;

    let semester = req.body.loadedFile.semester;
    let activities = req.body.loadedFile.activities;
    let studentActivities = req.body.loadedFile.student_activities;
    let titleActivities = req.body.loadedFile.title_activities;

    //Load semester
    let savedSemester = {};
        if (req.body.accepts.semester === true) {
        savedSemester = (await new SemesterModel({id: semesterId}).save({
            settings: semester.settings,
        })).toJSON();
    }

    //Load activity
    let savedActivities = [];
    if (req.body.accepts.activity === true) {
        activities = activities.map(activity => {
            activity.semester_id = semesterId;
            return activity;
        });
        await new ActivityModel().where("semester_id", semesterId).destroy({require: false});
        savedActivities = await db("activities").insert(activities).returning("*");
    } else {
        savedActivities = (await new ActivityModel().where("semester_id", semesterId).fetchAll()).toJSON();
    }

    //Load student activity
    let savedStudentActivities = [];
    if (req.body.accepts.student_activity === true) {
        studentActivities = studentActivities.map((studentActivity) => {
            activity = savedActivities.find(savedActivity => savedActivity.code === studentActivity.activity_code);
            studentActivity.activity_id = activity.id;
            delete studentActivity.activity_code;
            return studentActivity;
        });
        savedStudentActivities = await db("student_activities").insert(studentActivities).returning("*");
    }

    //Load title activity
    let savedTitleActivities = [];
    if (req.body.accepts.title_activity === true) {
        titleActivities = titleActivities.map((titleActivity) => {
            activity = savedActivities.find(savedActivity => savedActivity.code === titleActivity.activity_code);
            titleActivity.activity_id = activity.id;
            titleActivity.semester_id = semesterId;
            delete titleActivity.activity_code;
            return titleActivity;
        });
        await new TitleActivityModel().where("semester_id", semesterId).destroy({require: false});
        savedTitleActivities = await db("title_activities").insert(titleActivities).returning("*");
    }

    return res.json({semester: savedSemester, activities: savedActivities, titleActivities: savedTitleActivities, studentActivities: savedStudentActivities});
}));

module.exports = route;