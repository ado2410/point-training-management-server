import { check, CustomValidator } from "express-validator";
import { exists } from "../../utils/validator";
import SemesterModel from "../../models/SemesterModel";
import YearModel from "../../models/YearModel";
import ClassModel from "../../models/ClassModel";
import { db } from "../../utils/db";
import { Knex } from "knex";
import StudentModel from "../../models/StudentModel";
import ActivityModel from "../../models/ActivityModel";
import StudentActivityModel from "../../models/StudentActivityModel";
import TitleActivityModel from "../../models/TitleActivityModel";
import { Request, Response } from "express";
import SemesterStudentModel from "../../models/SemesterStudentModel";

//Fetch options
export const fetchOptions = {
    withRelated: ["year"],
}

//List
export const listSearch = ["name"];

export const listQuery = (queryBuilder: Knex.QueryBuilder<any, any>, req: Request) => {
    const yearId = req.query.year as string;
    if (yearId) queryBuilder = queryBuilder.where("year_id", yearId);
    return queryBuilder;
}

//Create
export const createOptions = {
    years: () => new YearModel().fetchAll(),
    keys: () => new ClassModel()
        .query(qb => qb.select(db.raw("DISTINCT SUBSTRING(classes.name, 1, 3) AS id"), db.raw("CONCAT('Khóa ', SUBSTRING(classes.name, 1, 3)) AS name"))
        .orderBy("id", "DESC"))
        .fetchAll(),
}

//View
export const viewAction = async (req: Request, res: Response) => {
    const semesterId = req.params.id as string;
    const semester = (await new SemesterModel({id: semesterId}).fetch({withRelated: ["year"]})).toJSON();

    let studentCount = 0;
    if (semester.settings.keys && semester.settings.keys.length > 0) {
        studentCount = await new StudentModel()
            .query(qb => {
                qb = qb.leftJoin("classes", "students.class_id", "classes.id");
                if (semester.settings?.keys?.length > 0)
                    qb = qb.whereIn(db.raw("SUBSTRING(classes.name, 1, 3)") as any, semester.settings.keys)
                return qb;
            })
            .count() as any;
    }
    const activityCount = {
        type1: await new ActivityModel().where("activity_type_id", 1).where("semester_id", semesterId).count(),
        type2: await new ActivityModel().where("activity_type_id", 2).where("semester_id", semesterId).count(),
        type3: await new ActivityModel().where("activity_type_id", 3).where("semester_id", semesterId).count(),
    };

    semester.activityCount = activityCount;
    semester.studentCount = studentCount;

    return res.json(semester);
}

//Insert and Update
const checkSemesterExists: CustomValidator = (value, { req }) =>
    exists(SemesterModel, "name", value, [], (qb) =>
        qb.where("year_id", req.body.year_id)
    );

export const insertAndUpdateRules = [
    check("name")
        .notEmpty()
        .withMessage("Không được để trống")
        .isIn([1, 2])
        .withMessage("Sai học kỳ")
        .not()
        .custom(checkSemesterExists)
        .withMessage("Đã tồn tại trong CSDL"),
    check("year_id").notEmpty().withMessage("Không được để trống"),
];

//Extra actions
export const getDashboardAction = async (req: Request, res: Response) => {
    const semesterId = req.params.id as string;
    const semester = (await new SemesterModel({id: semesterId}).fetch({withRelated: ["year"]})).toJSON();

    const data = await db.raw(`
        SELECT
            departments.id AS department_id,
            departments.name AS department_name,
            majors.id AS major_id,
            majors.name AS major_name,
            SUBSTRING(classes.name, 1, 3) AS key_name,
            classes.id AS class_id,
            classes.name AS class_name,
            COUNT (*) as student_count,
            COUNT (CASE WHEN students.gender = 'male' THEN 1 END) AS male_student_count,
            COUNT (CASE WHEN students.gender = 'female' THEN 1 END) AS female_student_count,
            COUNT (CASE WHEN semester_students.point >= 90 THEN 1 END) AS grade1_count,
            COUNT (CASE WHEN semester_students.point < 90 AND semester_students.point >= 80 THEN 1 END) AS grade2_count,
            COUNT (CASE WHEN semester_students.point < 80 AND semester_students.point >= 65 THEN 1 END) AS grade3_count,
            COUNT (CASE WHEN semester_students.point < 65 AND semester_students.point >= 50 THEN 1 END) AS grade4_count,
            COUNT (CASE WHEN semester_students.point < 50 AND semester_students.point >= 35 THEN 1 END) AS grade5_count,
            COUNT (CASE WHEN semester_students.point < 35 THEN 1 END) AS grade6_count
        FROM semester_students
            JOIN students ON students.id = semester_students.student_id
            JOIN classes ON classes.id = students.class_id
            JOIN majors ON majors.id = classes.major_id
            JOIN departments ON departments.id = majors.department_id
        WHERE semester_students.semester_id = ${semesterId}
        GROUP BY departments.id, departments.name, majors.id, majors.name, SUBSTRING(classes.name, 1, 3), classes.id, classes.name
        ORDER BY classes.name;
    `);
    semester.data = data.rows;

    return res.json(semester);
}

export const saveGeneralSettingAction = async (req: Request, res: Response) => {
    const semesterId = req.params.id;
    const settings = req.body;

    await new SemesterModel({id: semesterId}).save({settings: settings});
    const semester = await new SemesterModel({id: semesterId}).fetch();

    return res.json(semester);
};

export const copyAction = async (req: Request, res: Response) => {
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
};

export const saveDataAction = async (req: Request, res: Response) => {
    const semesterId = req.params.id;

    //Save semester setting
    const semester = (
        await new SemesterModel({ id: semesterId })
            .query((qb) => qb.select("settings"))
            .fetch()
    ).toJSON();

    //Save semester students
    let semester_students: any = [];
    semester_students = await new SemesterStudentModel().query((qb) =>
        qb.where("semester_id", semesterId)
            .select("student_id", "position", "point")
    ).fetchAll();

    //Save activities
    let activities: any = [];
    activities = await new ActivityModel()
        .query((qb) =>
            qb.where("semester_id", semesterId)
                .select(
                    "group_id",
                    "activity_type_id",
                    "name",
                    "time_start",
                    "time_end",
                    "address",
                    "host",
                    "description",
                    "type",
                    "accepts",
                    "default_value"
                )
        )
        .orderBy("id")
        .fetchAll();

    //Save all student activities
    let studentActivities: any = [];
    if (!req.query.type || req.query.type === "student_activity") {
        studentActivities = await new StudentActivityModel()
            .query((qb) =>
                qb.where("activities.semester_id", semesterId)
                    .join("activities", "activities.id", "student_activities.activity_id")
                    .join("students", "students.id", "student_activities.student_id")
                    .select(
                        "student_activities.student_id",
                        "students.student_code",
                        db.raw(`get_activity_code(${semesterId}, activities.id) AS activity_code`),
                        "student_activities.value"
                    )
            )
            .fetchAll();
    }

    //Save all title activities
    let titleActivities: any = [];
    titleActivities = await new TitleActivityModel().query(qb =>
            qb.where("title_activities.semester_id", semesterId)
                .join("activities", "activities.id", "title_activities.activity_id")
                .select(
                    "third_title_id",
                    db.raw(`get_activity_code(${semesterId}, activities.id) AS activity_code`),
                    "point",
                    "options"
                )
        )
        .fetchAll();

    return res.json({
        semester: semester,
        semester_students: semester_students,
        activities: activities,
        student_activities: studentActivities,
        title_activities: titleActivities,
    });
};

export const loadDataAction = async (req: Request, res: Response) => {
    const semesterId = req.params.id;
    let semester = req.body.loadedFile.semester;
    let semester_students = req.body.loadedFile.semester_students;
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

    //Load semester students
    let savedSemesterStudents: any = [];
    if (req.body.accepts.semester_student === true) {
        semester_students = semester_students.map((semester_student: any) => ({
            semester_id: semesterId,
            student_id: semester_student.student_id,
            position: semester_student.position,
            point: semester_student.point,
        }));
        await new SemesterStudentModel().where("semester_id", semesterId).destroy({require: false});
        await db("semester_students").insert(semester_students).returning("*");
    }
    savedSemesterStudents = (
        await new SemesterStudentModel()
            .where("semester_id", semesterId)
            .fetchAll()
    ).toJSON();

    //Load activity
    let savedActivities: any = [];
    if (req.body.accepts.activity === true) {
        activities = activities.map((activity: any) => ({
            semester_id: semesterId,
            activity_type_id: activity.activity_type_id,
            group_id: activity.group_id,
            name: activity.name,
            time_start: activity.time_start,
            time_end: activity.time_end,
            address: activity.address,
            host: activity.host,
            description: activity.description,
            type: activity.type,
            accepts: activity.accepts,
            default_value: activity.default_value,
        }));
        await new ActivityModel().where("semester_id", semesterId).destroy({require: false});
        await db("activities").insert(activities).returning("*");
    }
    savedActivities = (
        await new ActivityModel()
            .where("semester_id", semesterId)
            .fetchAll({columns: ["*", db.raw(`get_activity_code(${semesterId}, activities.id) AS code`) as any]})
    ).toJSON();

    //Load student activity
    let savedStudentActivities: any = [];
    if (req.body.accepts.student_activity === true && studentActivities.length > 0) {
        studentActivities = studentActivities.map((studentActivity: any) => {
            const activity = savedActivities.find((savedActivity: any) => savedActivity.code === studentActivity.activity_code);
            return {
                student_id: studentActivity.student_id,
                activity_id: activity.id,
                value: studentActivity.value,
            };
        });
        savedStudentActivities = await db("student_activities").insert(studentActivities).returning("*");
    }

    //Load title activity
    let savedTitleActivities: any = [];
    if (req.body.accepts.title_activity === true && titleActivities.length > 0) {
        titleActivities = titleActivities.map((titleActivity: any) => {
            const activity = savedActivities.find((savedActivity: any) => savedActivity.code === titleActivity.activity_code);
            return {
                third_title_id: titleActivity.third_title_id,
                activity_id: activity.id,
                semester_id: semesterId,
                point: titleActivity.point,
                options: titleActivity.options,
            }
        });
        await new TitleActivityModel().where("semester_id", semesterId).destroy({require: false});
        savedTitleActivities = await db("title_activities").insert(titleActivities).returning("*");
    }

    return res.json({
        semester: savedSemester,
        semesterStudents: savedSemesterStudents,
        activities: savedActivities,
        titleActivities: savedTitleActivities,
        studentActivities: savedStudentActivities,
    });
};