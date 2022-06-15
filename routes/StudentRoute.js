const TemplateRoute = require("./TemplateRoute");
const {body} = require("express-validator");
const Model = require("../models/StudentModel");
const ClassModel = require("../models/ClassModel");
const UserModel = require("../models/UserModel");
const {exists} = require("../utils/validator");
const {bookshelf} = require("../utils/db");
const Promise = require("bluebird");
const { db } = require("../utils/db");

const rules = (isImport = false) => ([
    body(`${isImport ? '*.' : ''}student_code`)
        .notEmpty().withMessage("Không được để trống")
        .not().custom((value, {req}) => exists(Model, value, "student_code", [req.params.id])).withMessage("Đã tồn tại trong CSDL"),
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
            if (req.params.id) student = (await new Model({id: req.params.id}).fetch()).toJSON();
            return exists(UserModel, "username", value, student ? [student.user_id] : []);
    }).withMessage("Đã tồn tại trong CSDL"),
    body(`${isImport ? '*.' : ''}email`)
        .notEmpty().withMessage("Không được để trống")
        .isEmail().withMessage("Không phải là email")
        .not().custom(async (value, {req}) => {
            let student = null;
            if (req.params.id) student = (await new Model({id: req.params.id}).fetch()).toJSON();
            return exists(UserModel, "email", value, student ? [student.user_id] : []);
    }).withMessage("Đã tồn tại trong CSDL"),
]);

module.exports = TemplateRoute(
    Model,
    {
        fetchOptions: {
            withRelated: ["user", "class"],
        },
        list: {
            search: ["student_code", "first_name", "last_name", "username", "email", db.raw("CONCAT(first_name, ' ', last_name)")],
            query: (qb, req) => {
                qb = qb.query(innerQb => innerQb.join("users", "users.id", "students.user_id"));
                if (req.query.class)
                    qb = qb.where("class_id", req.query.class);
                return qb;
            },
        },
        create: {
            options: {
                classes: () => new ClassModel().fetchAll(),
            }
        },
        insert: {
            rules: rules,
            custom: async (req, res) => {
                const user = await new UserModel({
                    user_type_id: 3,
                    username: req.body.username,
                    password: req.body.password,
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    email: req.body.email,
                }).save();
                let student = await new Model({
                    user_id: user.id,
                    class_id: req.body.class_id,
                    student_code: req.body.student_code,
                    gender: req.body.gender,
                    dob: req.body.dob,
                }).save();

                student = await new Model({id: student.id}).fetch({withRelated: ['user', 'class']});
                return res.json(student);
            },
        },
        import: {
            rules: rules(true),
            custom: async (req, res) => {
                const users = req.body.map(item => ({
                    user_type_id: 3,
                    username: item.username,
                    password: item.password,
                    first_name: item.first_name,
                    last_name: item.last_name,
                    email: item.email,
                }));
                let Collection = bookshelf.Collection.extend({model: UserModel});
                let collection = Collection.forge(users);
                let data = await Promise.all(collection.invokeMap('save'));

                const students = req.body.map((item, index) => ({
                    user_id: data[index].id,
                    class_id: item.class_id,
                    student_code: item.student_code,
                    gender: item.gender,
                    dob: item.dob,
                }));
                Collection = bookshelf.Collection.extend({model: Model});
                collection = Collection.forge(students);
                data = await Promise.all(collection.invokeMap('save'));
                const studentIds = data.map(data => data.id);

                data = await new Model().where("id", "in", studentIds).fetchAll({withRelated: ['user', 'class']});

                return res.json(data);
            }
        },
        update: {
            rules: rules(),
            custom: async (req, res) => {
                let student = await new Model({id: req.params.id}).save({
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

                student = await new Model({id: student.id}).fetch({withRelated: ['user', 'class']});
                return res.json(student);
            },
        },
        delete: {
            custom: async (req, res) => {
                let student = await new Model({id: req.params.id}).fetch();
                student = JSON.parse(JSON.stringify(student));
                await new Model({id: req.params.id}).destroy();
                await new UserModel({id: student.user_id}).destroy();
                return res.json(student);
            }
        }
    }
);