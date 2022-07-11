import bookshelf from "bookshelf";
import { body } from "express-validator";
import ClassModel from "../models/ClassModel";
import StudentModel from "../models/StudentModel";
import UserModel from "../models/UserModel";
import { db } from "../utils/db";
import { exists } from "../utils/validator";
import templateRoute from "./template/template.route";

const rules = (isImport = false) => ([
    body(`${isImport ? '*.' : ''}student_code`)
        .notEmpty().withMessage("Không được để trống")
        .not().custom((value, {req}) => exists(StudentModel, value, "student_code", [req.params?.id])).withMessage("Đã tồn tại trong CSDL"),
    body(`${isImport ? '*.' : ''}first_name`)
        .notEmpty().withMessage("Không được để trống"),
    body(`${isImport ? '*.' : ''}last_name`)
        .notEmpty().withMessage("Không được để trống"),
    body(`${isImport ? '*.' : ''}gender`)
        .notEmpty().withMessage("Không được để trống")
        .isIn(["male", "female"]).withMessage("Giới tính không hợp lệ"),
    body(`${isImport ? '*.' : ''}dob`)
        .notEmpty().withMessage("Không được để trống")
        .not().isDate().withMessage("Không phải định dạng ngày tháng"),
    body(`${isImport ? '*.' : ''}class_id`)
        .notEmpty().withMessage("Không được để trống")
        .custom((value, {req}) => exists(ClassModel, "id", value)).withMessage("Không tồn tại trong CSDL"),
    body(`${isImport ? '*.' : ''}username`)
        .notEmpty().withMessage("Không được để trống")
        .isAlphanumeric().withMessage("Chỉ được phép kí tự chữ cái (A-Z), (a-z) và (0-9)")
        .isLength({min: 3, max: 20}).withMessage("Độ dài ít nhất là 3 và tối đa là 20")
        .not().custom(async (value, {req}) => {
            let student = null;
            if (req.params?.id) student = (await new StudentModel({id: req.params.id}).fetch()).toJSON();
            return exists(UserModel, "username", value, student ? [student.user_id] : []);
    }).withMessage("Đã tồn tại trong CSDL"),
    body(`${isImport ? '*.' : ''}email`)
        .notEmpty().withMessage("Không được để trống")
        .isEmail().withMessage("Không phải là email")
        .not().custom(async (value, {req}) => {
            let student = null;
            if (req.params?.id) student = (await new StudentModel({id: req.params.id}).fetch()).toJSON();
            return exists(UserModel, "email", value, student ? [student.user_id] : []);
    }).withMessage("Đã tồn tại trong CSDL"),
]);

export default templateRoute(
    StudentModel,
    {
        fetchOptions: {
            withRelated: ["user", "class"],
        },
        list: {
            search: ["student_code", "first_name", "last_name", "username", "email", db.raw("CONCAT(first_name, ' ', last_name)") as any],
            query: (qb, req) => {
                const classId = req.query.class as string;
                //qb = qb.join("users", "users.id", "students.user_id");
                if (classId) qb = qb.where("class_id", classId);
                return qb;
            },
        },
        create: {
            options: {
                classes: () => new ClassModel().fetchAll(),
            }
        },
        insert: {
            rules: rules(),
            custom: async (req, res) => {
                const user = await new UserModel({
                    user_type_id: 3,
                    username: req.body.username,
                    password: req.body.password,
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    email: req.body.email,
                }).save();
                let student: any = await new StudentModel({
                    user_id: user.id,
                    class_id: req.body.class_id,
                    student_code: req.body.student_code,
                    gender: req.body.gender,
                    dob: req.body.dob,
                }).save();

                student = await new StudentModel({id: student.id}).fetch({withRelated: ['user', 'class']});
                return res.json(student);
            },
        },
        import: {
            rules: rules(true),
            custom: async (req, res) => {
                const users = req.body.map((item: any) => ({
                    user_type_id: 3,
                    username: item.username,
                    password: item.password,
                    first_name: item.first_name,
                    last_name: item.last_name,
                    email: item.email,
                }));
                let data: any = await UserModel.collection().add(users).invokeThen('save');

                const students = req.body.map((item: any, index: number) => ({
                    user_id: data[index].id,
                    class_id: item.class_id,
                    student_code: item.student_code,
                    gender: item.gender,
                    dob: item.dob,
                }));
                data = await StudentModel.collection().add(students).invokeThen('save');
                const studentIds = data.map((data: any) => data.id);

                data = await new StudentModel().where("id", "in", studentIds).fetchAll({withRelated: ['user', 'class']});

                return res.json(data);
            }
        },
        update: {
            rules: rules(),
            custom: async (req, res) => {
                let student: any = await new StudentModel({id: req.params.id}).save({
                    class_id: req.body.class_id,
                    student_code: req.body.student_code,
                    gender: req.body.gender,
                    dob: req.body.dob,
                });
                student = JSON.parse(JSON.stringify(student));

                await new UserModel({id: student.user_id}).save({
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    email: req.body.email,
                });

                student = await new StudentModel({id: student.id}).fetch({withRelated: ['user', 'class']});
                return res.json(student);
            },
        },
        delete: {
            custom: async (req, res) => {
                let student: any = await new StudentModel({id: req.params.id}).fetch();
                student = JSON.parse(JSON.stringify(student));
                await new StudentModel({id: req.params.id}).destroy();
                await new UserModel({id: student.user_id}).destroy();
                return res.json(student);
            }
        }
    }
);