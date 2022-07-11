import { NextFunction, Request, Response } from "express";
import { body } from "express-validator";
import adminMiddleware from "../middleware/adminMiddleware";
import loginMiddleware from "../middleware/loginMiddleware";
import PrimaryTitleModel from "../models/PrimaryTitleModel";
import SemesterModel from "../models/SemesterModel";
import SemesterStudentModel from "../models/SemesterStudentModel";
import StudentModel from "../models/StudentModel";
import { db } from "../utils/db";
import { throwError } from "../utils/error";
import { asyncRoute } from "../utils/route";
import { getActivityCodeBuilder } from "./Activity/Activity.actions";
import templateRoute from "./template/template.route";
import { UserType } from "./User/User.constants";

const rules = [
    body('position').notEmpty().withMessage("Không được để trống")
];

const route = templateRoute(
    SemesterStudentModel,
    {
        middleware: [loginMiddleware, adminMiddleware],
        list: {
            custom: async (req, res) => {
                const semesterId = req.query.semester as string;
                const studentId = req.query.student as string;
                const classId = req.query.class as string;
            
                let semester = (await new SemesterModel({id: semesterId}).fetch({withRelated: ['year']})).toJSON();
            
                if (studentId) {
                    let data: any = (await new PrimaryTitleModel().orderBy("order").fetchAll({
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
                                'secondary_titles.third_titles.title_activities.activity': (qb) => qb.select('*', getActivityCodeBuilder(semesterId, "id")),
                            },
                            {
                                'secondary_titles.third_titles.title_activities.activity.student_activity': (qb) => qb.where('student_id', studentId),
                            },
                        ]
                    })).toJSON();
                    let student = await new StudentModel({id: req.query.student}).fetch({withRelated: ['user', 'class.major.department']});
                    return res.json({data: data, student: student, semester: semester});
                } else {
                    let model = new StudentModel();
                    if (classId) model = model.where("class_id", classId);
                    const studentPoints = await model.query(qb => {
                        qb = qb.leftJoin("classes", "students.class_id", "classes.id")
                        if (semester.settings?.keys?.length > 0)
                            qb = qb.whereIn(db.raw("SUBSTRING(classes.name, 1, 3)") as any, semester.settings.keys);
                        return qb;
                    }).fetchAll({withRelated: ['user', 'class', 'semester_student', { 'semester_student': (qb) => qb.where("semester_id", semesterId) }]});
                    return res.json({data: studentPoints});
                }
            }
        },
        update: {
            rules: rules,
            fields: ["position"],
        }
    }
);

route.post("/update", asyncRoute(async (req, res) => {
    const semesterId = req.query.semester;
    let semester = (await new SemesterModel({id: semesterId}).fetch({withRelated: ['year']})).toJSON();

    const keys = semester.settings?.keys ? "'" + semester.settings.keys.join("', '") + "'" : '';

    await db.raw(`
    DELETE FROM semester_students
    WHERE semester_students.id IN (
        SELECT semester_students.id
        FROM students
            INNER JOIN semester_students ON students.id = semester_students.student_id AND semester_students.semester_id = ${semesterId}
            INNER JOIN classes ON classes.id = students.class_id
        WHERE SUBSTRING(classes.name, 1, 3) NOT IN (${keys})
    );

    INSERT INTO semester_students (semester_id, student_id, point)
    (
        SELECT ${semesterId}, students.id, (SELECT SUM(calculate_point(${semesterId}, students.id, third_titles.id)) FROM third_titles) AS point
        FROM students INNER JOIN classes ON classes.id = students.class_id
        WHERE SUBSTRING(classes.name, 1, 3) IN (${keys})
    )
    ON CONFLICT (semester_id, student_id)
    DO UPDATE SET point = EXCLUDED.point;
    `);

    return res.json({status: true});
}));

export default route;