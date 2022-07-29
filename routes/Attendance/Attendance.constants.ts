import { Request, Response } from "express";
import { body } from "express-validator";
import StudentActivityModel from "../../models/StudentActivityModel";
import StudentModel from "../../models/StudentModel";
import { isStudent, UserType } from "../User/User.constants";

export const getAttendanceAction = async (req: Request, res: Response) => {
    const auth = req.headers.auth as any;
    const classId = req.query.class as string;
    let data: any = new StudentModel();

    if (isStudent(auth))
        data = data.where("class_id", auth.student.class_id);

    if (classId)
        data = data.where("class_id", classId);
    data = data.fetchAll({
        withRelated: ['student_activities.activity', 'class', 'user']});
    data = await data;
    return res.json({data: data});
}

export const saveAttendanceRules = [
    body("student_id").notEmpty().withMessage("Không được để trống"),
    body("activity_id").notEmpty().withMessage("Không được để trống"),
    body("value").notEmpty().withMessage("Không được để trống")
];

export const saveAttendanceAction = async (req: Request, res: Response) => {    
    const studentId = req.body.student_id as string;
    const activityId = req.body.activity_id as string;
    const value = req.body.value as number;
    let result = await new StudentActivityModel().where({student_id: studentId, activity_id: activityId}).fetch({require: false});
    if (result) {
        const data = await new StudentActivityModel({id: result.id}).save({value: value});
        return res.json({data: data});
    } else {
        const data = await new StudentActivityModel({
            student_id: studentId,
            activity_id: activityId,
            value: value
        }).save();
        return res.json({data: data});
    }
}