const express = require("express");
const {asyncRoute} = require("../utils/route");
const StudentModel = require("../models/StudentModel");
const StudentActivityModel = require("../models/StudentActivityModel");
const route = express.Router({mergeParams: true});

route.get("/", asyncRoute(async (req, res) => {
    let data = await new StudentModel().fetchAll({
        withRelated: ['student_activities.activity', 'class', 'user']});
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