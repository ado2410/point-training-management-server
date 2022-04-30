require('dotenv').config();
const pg = require('pg');
pg.types.setTypeParser(20, 'text', parseInt);
const express = require('express');
const cors = require('cors');
const UserRoute = require('./routes/UserRoute');
const DepartmentRoute = require('./routes/DepartmentRoute');
const MajorRoute = require('./routes/MajorRoute');
const ClassRoute = require('./routes/ClassRoute');
const StudentRoute = require('./routes/StudentRoute');
const YearRoute = require('./routes/YearRoute');
const SemesterRoute = require('./routes/SemesterRoute');
const ActivityRoute = require('./routes/ActivityRoute');
const SheetRoute = require('./routes/SheetRoute');
const TitleActivityRoute = require('./routes/TitleActivityRoute');
const AttendanceRoute = require('./routes/AttendanceRoute');
const PointRoute = require('./routes/PointRoute');

const app = express();
app.use(express.json({limit: "1mb"}));
app.use(cors());

app.use("/users", UserRoute);
app.use("/departments", DepartmentRoute);
app.use("/majors", MajorRoute);
app.use("/classes", ClassRoute);
app.use("/students", StudentRoute);
app.use("/years", YearRoute);
app.use("/semesters", SemesterRoute);
app.use("/activities", ActivityRoute);
app.use("/sheets", SheetRoute);
app.use("/title_activities", TitleActivityRoute);
app.use("/attendance", AttendanceRoute);
app.use("/point", PointRoute);

app.listen(3100, () => console.log("Connected to server"));

/*
// Calculate real point in user_activities and activity tables.
// The result is dependent on the input_options field in activity table and value in user_activities table.
// It return current attendance
const calculateUserActivityPoint = (userActivity) => {
    const inputOptions = userActivity.input_options;
    const value = userActivity.value;
    let point = null;
    let label = '';

    switch (inputOptions.type) {
        case "check":
            point = value ? inputOptions.point : 0;
            label = value === 1 ? 'Có' : value === 0 ? 'Không' : 'Chưa xét';
            break;
        case "count":
            point = inputOptions.point * value;
            label = `${value} lần`;

            inputOptions.options?.map(option => {
                const optionType = option.type;
                const optionValue = option.value;
                const optionPoint = option.point;

                switch (optionType) {
                    case "gt":
                        if (value > optionValue) point = optionPoint;
                        break;
                    case "gte":
                        if (value >= optionValue) point = optionPoint;
                        break;
                    case "lt":
                        if (value < optionValue) point = optionPoint;
                        break;
                    case "lte":
                        if (value <= optionValue) point = optionPoint;
                        break;
                    case "eq":
                    if (value === optionValue) point = optionPoint;
                    break;
                }
            });

            break;
        case "enum":
            point = inputOptions.points[value];
            label = inputOptions.accepts[value];
            break;
        default:
            return attendance;
    }

    userActivity.point = point;
    userActivity.label = label;
    return userActivity;
}

app.get('/', async (req, res) => {
    const userActivities = await db.select("users.first_name", "users.last_name", "activities.name", "user_activities.value", "activities.input_options")
        .from("users")
        .join("user_activities", "user_activities.user_id", "users.id")
        .join("activities", "activities.id", "user_activities.activity_id")

    const calculatedUserActivities = userActivities.map(calculateUserActivityPoint);

    res.status(200).json(calculatedUserActivities);
});

app.get('/consider/:id', async (req, res) => {
    const userId = req.params.id;

    const titleActivities = await db.select("*").from("title_activities");
    let userActivities = await db.select("*").from("user_activities").join("activities", "activities.id", "user_activities.activity_id").where("user_id", userId);
    userActivities = userActivities.map(calculateUserActivityPoint);
    let thirdTitles = await db.select("*").from("third_titles");

    thirdTitles = thirdTitles.map(title => {
        const currentTitleActivities = titleActivities.filter(titleActivity => titleActivity.third_title_id === title.id);
        let sumPoint = title.default_point;
        currentTitleActivities.map(currentTitleActivity => {
            const currentUserActivity = userActivities.filter(userActivity => userActivity.activity_id === currentTitleActivity.activity_id);
            if (currentUserActivity.length > 0) sumPoint += currentUserActivity[0].point;
        });

        sumPoint = Math.min(Math.max(parseInt(sumPoint), 0), title.max_point);

        title.sumPoint = sumPoint;
        return title;
    });

    res.status(200).json(thirdTitles);
});

app.get('/add', async (req, res) => {
    await db.from("activities").insert([
        { code: "LT", name: "Cuộc thi Lập trình UDCK Code Contest 2021", description: "Dành cho tất cả sinh viên", input_options: {type: "check", point: 4 }, semester_id: 1, activity_type: 1 },
    ]);

    await db.from("title_activities").insert([
        { third_title_id: 2, activity_id: 5 },
    ]);

    await db.from("user_activities").insert([
        { user_id: 2, activity_id: 5, value: 1 },
    ]);

    res.send('ok');
});*/
