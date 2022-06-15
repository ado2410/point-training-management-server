const {bookshelf} = require("../utils/db");
module.exports = bookshelf.model("SemesterStudent", {
    tableName: "semester_students",
    semester() {
        return this.belongsTo("Semester");
    }
});