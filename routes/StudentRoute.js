const TemplateRoute = require("./TemplateRoute");
const {check} = require("express-validator");
const Model = require("../models/StudentModel");
const ClassModel = require("../models/ClassModel");

const rules = [
    check("student_code")
        .notEmpty().withMessage("Không được để trống"),
    check("first_name")
        .notEmpty().withMessage("Không được để trống"),
    check("last_name")
        .notEmpty().withMessage("Không được để trống"),
    check("gender")
        .notEmpty().withMessage("Không được để trống")
        .isIn(["male", "female"]).withMessage("Giới tính không hợp lệ"),
    check("dob")
        .notEmpty().withMessage("Không được để trống")
        .isDate().withMessage("Không phải định dạng ngày tháng"),
    check("class_id")
        .notEmpty().withMessage("Không được để trống"),
    check("username")
        .notEmpty().withMessage("Không được để trống")
        .isAlphanumeric().withMessage("Chỉ được phép kí tự chữ cái (A-Z), (a-z) và (0-9)")
        .isLength({min: 3, max: 20}).withMessage("Độ dài ít nhất là 3 và tối đa là 20"),
    check("password")
        .notEmpty().withMessage("Không được để trống"),
    check("email")
        .notEmpty().withMessage("Không được để trống")
        .isEmail().withMessage("Không phải là email"),
];

module.exports = TemplateRoute(
    Model,
    {
        list: {
            fetch: (req, res) => new Model().where("class_id", req.query.class).orderBy("created_at", "DESC").fetchAll({withRelated: ['user', 'class']}),
        },
        create: {
            options: {
                classes: () => new ClassModel().fetchAll(),
                genders: [
                    {id: "male", name: "Nam"},
                    {id: "female", name: "Nữ"},
                ],
            }
        },
        insert: {
            rules: rules,
            fields: ["name"]
        },
        update: {
            rules: rules,
            fields: ["name"]
        }
    }
);