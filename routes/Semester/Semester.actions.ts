import SemesterModel from "../../models/SemesterModel";
import StudentModel from "../../models/StudentModel";
import { db } from "../../utils/db";
import ActivityModel from "../../models/ActivityModel";
import StudentActivityModel from "../../models/StudentActivityModel";
import TitleActivityModel from "../../models/TitleActivityModel";
import { handleSemester } from "./Semester.constants";
import { Request, Response } from "express";

export const viewAction = async (req: Request, res: Response) => {
    const semesterId = req.params.id as string;
    const semester = (await new SemesterModel({id: semesterId}).fetch({withRelated: ["year"]})).toJSON();
    const studentCount = await new StudentModel()
        .query(qb => {
            qb = qb.leftJoin("classes", "students.class_id", "classes.id");
            if (semester.settings?.keys?.length > 0)
                qb = qb.whereIn(db.raw("SUBSTRING(classes.name, 1, 3)") as any, semester.settings.keys)
            return qb;
        })
        .count();
    const activityCount = {
        type1: await new ActivityModel().where("activity_type_id", 1).where((qb: any) => handleSemester(qb, semesterId)).count(),
        type2: await new ActivityModel().where("activity_type_id", 2).where((qb: any) => handleSemester(qb, semesterId)).count(),
        type3: await new ActivityModel().where("activity_type_id", 3).where((qb: any) => handleSemester(qb, semesterId)).count(),
    };

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

    semester.activityCount = activityCount;
    semester.studentCount = studentCount;
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
    const fileData = 'SGVsbG8sIFdvcmxkIQ==';
    const fileName = `data_semesterID-${semesterId}.json`;
    const fileType = 'text/plain';
    res.writeHead(200, {
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Type': fileType,
    });

    //Save semester setting
    const semester = (await new SemesterModel({id: semesterId}).query(qb => qb.select("settings")).fetch()).toJSON();
    delete semester.id;

    //Save activities
    let activities: any = [];
    if (!req.query.type || req.query.type === 'activity') {
        activities = await new ActivityModel().query(qb => qb.select(db.raw(`get_group_full_code(group_id) AS group`), "activity_type_id", db.raw(`get_activity_code(${semesterId}, id) AS code`), "name", "time_start", "time_end", "address", "host", "description", "type", "accepts", "default_value")).fetchAll();
    }

    //Save all student activities
    let studentActivities: any = [];
    if (!req.query.type || req.query.type === 'student_activity') {
        studentActivities = await new StudentActivityModel().query(qb =>
            qb.join("activities", "activities.id", "student_activities.activity_id")
            .select("student_activities.student_id", db.raw(`get_activity_code(${semesterId}, activities.id) AS activity_code`), "student_activities.value")
        ).fetchAll();
    }

    //Save all title activities
    let titleActivities: any = [];
    if (!req.query.type || req.query.type === 'title_activity') {
        titleActivities = await new TitleActivityModel()
            .query(qb =>
                qb.join("activities", "activities.id", "title_activities.activity_id")
                .select("third_title_id", db.raw(`get_activity_code(${semesterId}, activities.id) AS activity_code`), "point", "options")
            )
            .where("title_activities.semester_id", semesterId)
            .fetchAll();
    }
    
    let data = JSON.stringify({semester: semester, activities: activities, student_activities: studentActivities, title_activities: titleActivities}, null, 2);

    return res.end(data);
};

export const loadDataAction = async (req: Request, res: Response) => {
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
    let savedActivities: any = [];
    if (req.body.accepts.activity === true) {
        activities = activities.map((activity: any) => {
            activity.group_id = db.raw(`get_id_from_group_full_code('${activity.group}')`);
            activity.semester_id = semesterId;
            delete activity.code;
            delete activity.group;
            return activity;
        });
        await new ActivityModel().where("semester_id", semesterId).destroy({require: false});
        await db("activities").insert(activities).returning("*");
    }
    savedActivities = (await new ActivityModel().where("semester_id", semesterId).fetchAll({columns: ['*', db.raw(`get_activity_code(${semesterId}, activities.id) AS code`) as any]})).toJSON();

    //Load student activity
    let savedStudentActivities: any = [];
    if (req.body.accepts.student_activity === true && studentActivities.length > 0) {
        studentActivities = studentActivities.map((studentActivity: any) => {
            const activity = savedActivities.find((savedActivity: any) => savedActivity.code === studentActivity.activity_code);
            studentActivity.activity_id = activity.id;
            delete studentActivity.activity_code;
            return studentActivity;
        });
        savedStudentActivities = await db("student_activities").insert(studentActivities).returning("*");
    }

    //Load title activity
    let savedTitleActivities: any = [];
    if (req.body.accepts.title_activity === true && titleActivities.length > 0) {
        titleActivities = titleActivities.map((titleActivity: any) => {
            const activity = savedActivities.find((savedActivity: any) => savedActivity.code === titleActivity.activity_code);
            titleActivity.activity_id = activity.id;
            titleActivity.semester_id = semesterId;
            delete titleActivity.activity_code;
            return titleActivity;
        });
        await new TitleActivityModel().where("semester_id", semesterId).destroy({require: false});
        savedTitleActivities = await db("title_activities").insert(titleActivities).returning("*");
    }

    return res.json({semester: savedSemester, activities: savedActivities, titleActivities: savedTitleActivities, studentActivities: savedStudentActivities});
};