const express = require("express");
const {asyncRoute} = require("../utils/route");
const StudentModel = require("../models/StudentModel");
const StudentActivityModel = require("../models/StudentActivityModel");
const ClassModel = require("../models/ClassModel");
const route = express.Router({mergeParams: true});

route.get("/", asyncRoute(async (req, res) => {
    let data = new StudentModel();
    if (req.query.class)
        data = data.where("class_id", req.query.class);
    data = data.fetchAll({
        withRelated: ['student_activities.activity', 'class', 'user']});
    data = await data;
    return res.json({data: data});
}));

route.post("/", asyncRoute(async (req, res) => {
    let data = await new StudentActivityModel().where({student_id: req.body.student_id, activity_id: req.body.activity_id}).fetch().catch(err => {});
    if (data) {
        data.value = req.body.value;
        data = await data.save({value: data.value});
        return res.json({data: data});
    } else {
        data = await new StudentActivityModel().save(req.body);
        return res.json({data: data})
    }
}));

module.exports = route;