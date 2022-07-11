import * as dotenv from 'dotenv';
dotenv.config();
import express from "express";
import ActivityRoute from "./routes/Activity/Activity.route";
import AttendanceRoute from "./routes/AttendanceRoute";
import ClassRoute from "./routes/Class/Class.route";
import DepartmentRoute from "./routes/DepartmentRoute";
import GroupRoute from './routes/GroupRoute';
import MajorRoute from "./routes/MajorRoute";
import SemesterRoute from "./routes/Semester/Semester.route";
import SemesterStudentRoute from "./routes/SemesterStudentRoute";
import StudentRoute from "./routes/StudentRoute";
import TitleActivityRoute from "./routes/TitleActivityRoute";
import UserRoute from "./routes/User/User.route";
import YearRoute from "./routes/Year/Year.route";
import LoginRoute from "./routes/Login.route";
import authMiddleware from './middleware/authMiddleware';

const pg = require('pg');
pg.types.setTypeParser(20, 'text', parseInt);
const cors = require('cors');

const app = express();
app.use(express.json({limit: "1mb"}));
app.use(cors());

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
app.use("/title_activities", TitleActivityRoute);
app.use("/attendance", AttendanceRoute);
app.use("/semester_students", SemesterStudentRoute);

app.listen(3100, () => console.log("Connected to server"));