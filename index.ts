import * as dotenv from 'dotenv';
dotenv.config();
import express from "express";
import ActivityRoute from "./routes/Activity/Activity.route";
import AttendanceRoute from "./routes/Attendance/Attendance.route";
import ClassRoute from "./routes/Class/Class.route";
import DepartmentRoute from "./routes/Department/Department.route";
import GroupRoute from './routes/Group/Group.route';
import MajorRoute from "./routes/Major/Major.route";
import SemesterRoute from "./routes/Semester/Semester.route";
import SemesterStudentRoute from "./routes/SemesterStudent/SemesterStudent.route";
import StudentRoute from "./routes/Student/Student.route";
import ConfigurationRoute from "./routes/Configuration/Configuration.route";
import UserRoute from "./routes/User/User.route";
import YearRoute from "./routes/Year/Year.route";
import LoginRoute from "./routes/Login.route";
import authMiddleware from './middleware/authMiddleware';
import pg from "pg";
import path from 'path';

const types = pg.types;
const INT_OID = 20;
const TIMESTAMPTZ_OID = 1184;
const TIMESTAMP_OID = 1114;
types.setTypeParser(INT_OID, 'text', parseInt);
types.setTypeParser(TIMESTAMPTZ_OID, val => val);
types.setTypeParser(TIMESTAMP_OID, val => val);
const cors = require('cors');

const app = express();
app.use(express.json({limit: "1mb"}));
app.use(cors());
app.use("/public", express.static(path.join(__dirname, 'public')));

app.use(authMiddleware);

app.use("/", LoginRoute);
app.use("/groups", GroupRoute);
app.use("/departments", DepartmentRoute);
app.use("/users", UserRoute);
app.use("/majors", MajorRoute);
app.use("/classes", ClassRoute);
app.use("/students", StudentRoute);
app.use("/years", YearRoute);
app.use("/semesters", SemesterRoute);
app.use("/activities", ActivityRoute);
app.use("/configurations", ConfigurationRoute);
app.use("/attendance", AttendanceRoute);
app.use("/semester_students", SemesterStudentRoute);

app.listen(3100, () => console.log("Connected to server"));