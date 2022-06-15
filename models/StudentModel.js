const {bookshelf} = require("../utils/db");
module.exports = bookshelf.model("Student", {
    tableName: "students",
    user() {
        return this.belongsTo("User");
    },
    class() {
        return this.belongsTo("Class");
    },
    student_activities() {
        return this.hasMany("StudentActivity");
    },
    semester_student() {
        return this.hasOne("SemesterStudent");
    }
});