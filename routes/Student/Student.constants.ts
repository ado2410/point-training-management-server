import { Request, Response } from "express";
import { body, CustomValidator } from "express-validator";
import { Knex } from "knex";
import ClassModel from "../../models/ClassModel";
import StudentModel from "../../models/StudentModel";
import UserModel from "../../models/UserModel";
import { db } from "../../utils/db";
import { exists } from "../../utils/validator";

//Fetch options
export const fetchOptions = {
    withRelated: ["user", "class"],
}

//List
export const listSearch = ["student_code", "users.first_name", "users.last_name", "username", "email", db.raw("CONCAT(first_name, ' ', last_name)") as any];

export const listQuery = (queryBuilder: Knex.QueryBuilder<any, any>, req: Request) => {
    queryBuilder.join("users", "users.id", "students.user_id");
    const classId = req.query.class as string;
    if (classId) queryBuilder.where("class_id", classId);
    return queryBuilder;
}

//Create
export const createOptions = {
    classes: () => new ClassModel().fetchAll(),
}

//Import
const checkStudentCodeExists: CustomValidator = (value, {req}) => exists(StudentModel, "student_code", value, req.params?.id ? [req.params.id]: []);
const checkClassIdExists: CustomValidator = (value) => exists(ClassModel, "id", value);
const checkUserNameExists: CustomValidator = async (value, {req}) => {
    let student = null;
    if (req.params?.id) student = (await new StudentModel({id: req.params.id}).fetch()).toJSON();
    return exists(UserModel, "username", value, student ? [student.user_id] : []);
}
const checkEmailExists: CustomValidator = async (value, {req}) => {
    let student = null;
    if (req.params?.id) student = (await new StudentModel({id: req.params.id}).fetch()).toJSON();
    return exists(UserModel, "email", value, student ? [student.user_id] : []);
}

export const importRules = [
    body("*.student_code")
        .notEmpty().withMessage("Không được để trống")
        .not().custom(checkStudentCodeExists).withMessage("Đã tồn tại trong CSDL"),
    body("*.first_name")
        .notEmpty().withMessage("Không được để trống"),
    body("*.last_name")
        .notEmpty().withMessage("Không được để trống"),
    body("*.gender")
        .notEmpty().withMessage("Không được để trống")
        .isIn(["male", "female"]).withMessage("Giới tính không hợp lệ"),
    body("*.dob")
        .notEmpty().withMessage("Không được để trống")
        .not().isDate().withMessage("Không phải định dạng ngày tháng"),
    body("*.class_id")
        .notEmpty().withMessage("Không được để trống")
        .custom(checkClassIdExists).withMessage("Không tồn tại trong CSDL"),
    body("*.username")
        .notEmpty().withMessage("Không được để trống")
        .isAlphanumeric().withMessage("Chỉ được phép kí tự chữ cái (A-Z), (a-z) và (0-9)")
        .isLength({min: 3, max: 20}).withMessage("Độ dài ít nhất là 3 và tối đa là 20")
        .not().custom(checkUserNameExists).withMessage("Đã tồn tại trong CSDL"),
    body("*.email")
        .notEmpty().withMessage("Không được để trống")
        .isEmail().withMessage("Không phải là email")
        .not().custom(checkEmailExists).withMessage("Đã tồn tại trong CSDL"),
];

export const insertAndUpdateRules = [
    body("student_code")
        .notEmpty().withMessage("Không được để trống")
        .not().custom(checkStudentCodeExists).withMessage("Đã tồn tại trong CSDL"),
    body("first_name")
        .notEmpty().withMessage("Không được để trống"),
    body("last_name")
        .notEmpty().withMessage("Không được để trống"),
    body("gender")
        .notEmpty().withMessage("Không được để trống")
        .isIn(["male", "female"]).withMessage("Giới tính không hợp lệ"),
    body("dob")
        .notEmpty().withMessage("Không được để trống")
        .not().isDate().withMessage("Không phải định dạng ngày tháng"),
    body("class_id")
        .notEmpty().withMessage("Không được để trống")
        .custom(checkClassIdExists).withMessage("Không tồn tại trong CSDL"),
    body("username")
        .notEmpty().withMessage("Không được để trống")
        .isAlphanumeric().withMessage("Chỉ được phép kí tự chữ cái (A-Z), (a-z) và (0-9)")
        .isLength({min: 3, max: 20}).withMessage("Độ dài ít nhất là 3 và tối đa là 20")
        .not().custom(checkUserNameExists).withMessage("Đã tồn tại trong CSDL"),
    body("email")
        .notEmpty().withMessage("Không được để trống")
        .isEmail().withMessage("Không phải là email")
        .not().custom(checkEmailExists).withMessage("Đã tồn tại trong CSDL"),
];

export const importAction = async (req: Request, res: Response) => {
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

    data = await new StudentModel().where("id", "in", studentIds).fetchAll(fetchOptions);

    return res.json(data);
}

//Insert
export const insertAction = async (req: Request, res: Response) => {
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

    student = await new StudentModel({id: student.id}).fetch(fetchOptions);
    return res.json(student);
}

//Update
export const updateAction = async (req: Request, res: Response) => {
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

    student = await new StudentModel({id: student.id}).fetch(fetchOptions);
    return res.json(student);
}

//Delete
export const deleteAction = async (req: Request, res: Response) => {
    let student: any = await new StudentModel({id: req.params.id}).fetch();
    student = JSON.parse(JSON.stringify(student));
    await new StudentModel({id: req.params.id}).destroy();
    await new UserModel({id: student.user_id}).destroy();
    return res.json(student);
}