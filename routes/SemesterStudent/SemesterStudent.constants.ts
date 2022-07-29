import { Request, Response } from "express";
import { body } from "express-validator";
import PrimaryTitleModel from "../../models/PrimaryTitleModel";
import SemesterModel from "../../models/SemesterModel";
import SemesterStudentModel from "../../models/SemesterStudentModel";
import StudentModel from "../../models/StudentModel";
import { db } from "../../utils/db";
import { getActivityCodeRawBuilder } from "../Activity/Activity.actions";
import { searchQueryBuilder } from "../template/template.actions";

//List
export const listAction = async (req: Request, res: Response) => {
    const semesterId = req.query.semester as string;
    const classId = req.query.class as string;
    const keyword = req.query.search as string;
    let semester = (await new SemesterModel({id: semesterId}).fetch({withRelated: ['year']})).toJSON();
    let model = new StudentModel();

    if (semester.settings.keys && semester.settings.keys.length > 0) {
        if (classId) model = model.where("class_id", classId);
        const studentPoints = await model.query(qb => {
            qb = qb.leftJoin("classes", "students.class_id", "classes.id")
            qb = qb.join("users", "students.user_id", "users.id")
            if (semester.settings?.keys?.length > 0)
            qb = qb.whereIn(db.raw("SUBSTRING(classes.name, 1, 3)") as any, semester.settings.keys);
            qb = searchQueryBuilder(qb as any, keyword, ["student_code", db.raw("CONCAT(users.first_name, ' ', users.last_name)") as unknown as string]) as any;
            return qb;
        }).fetchAll({withRelated: ['user', 'class', 'semester_student', { 'semester_student': (qb) => qb.where("semester_id", semesterId) }]});
        return res.json({data: studentPoints});
    } else {
        return res.json({data: []});
    }
}

//Update
export const updateRules = [
    body('position').notEmpty().withMessage("Không được để trống")
];

export const updateFields = ["position"];

//Extra actions
export const viewPointAction = async (req: Request, res: Response) => {
    const semesterId = req.query.semester as string;
    const studentId = req.query.student as string;
    let semester = (await new SemesterModel({id: semesterId}).fetch({withRelated: ['year']})).toJSON();
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
                'secondary_titles.third_titles.title_activities.activity': (qb) => qb.select('*', getActivityCodeRawBuilder(semesterId, "id")),
            },
            {
                'secondary_titles.third_titles.title_activities.activity.student_activity': (qb) => qb.where('student_id', studentId),
            },
        ]
    })).toJSON();
    let student = await new StudentModel({id: req.query.student}).fetch({withRelated: ['user', 'class.major.department']});
    return res.json({data: data, student: student, semester: semester});
}

export const syncAction = async (req: Request, res: Response) => {
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

    //Cập nhật sync at
    await new SemesterModel({id: semesterId}).save({sync_at: db.raw("NOW()")});

    return res.json({status: true});
}

export const getSemesterStudentAction = async (req: Request, res: Response) => {
    const studentId = req.params.studentId;
    const semesterStudents = await new SemesterStudentModel()
        .query(queryBuilder =>
            queryBuilder.rightJoin("semesters", "semesters.id", "semester_students.semester_id")
                .where("student_id", studentId)
                .orWhereNull("student_id")
                .select("*", "semesters.id AS semester_id")
        ).fetchAll({withRelated: ["semester.year"]});
    return res.json({data: semesterStudents});
}