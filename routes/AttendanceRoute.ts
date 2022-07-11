import StudentActivityModel from "../models/StudentActivityModel";
import StudentModel from "../models/StudentModel";
import { asyncRoute } from "../utils/route";

const express = require("express");
const route = express.Router({mergeParams: true});

route.get("/", asyncRoute(async (req, res) => {
    const classId = req.query.classId as string;
    let data: any = new StudentModel();
    if (classId)
        data = data.where("class_id", classId);
    data = data.fetchAll({
        withRelated: ['student_activities.activity', 'class', 'user']});
    data = await data;
    return res.json({data: data});
}));

route.post("/", asyncRoute(async (req, res) => {
    const studentId = req.body.student_id as number;
    const activityId = req.body.activity_id as number;
    const value = req.body.value as number;
    let data: any = await new StudentActivityModel().where({student_id: studentId, activity_id: activityId}).fetch().catch(err => {});
    if (data) {
        data.value = value;
        data = await data.save({value: data.value});
        return res.json({data: data});
    } else {
        data = await new StudentActivityModel().save(req.body);
        return res.json({data: data})
    }
}));

export default route;