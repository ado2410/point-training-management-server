const {bookshelf} = require("../utils/db");
module.exports = bookshelf.model("StudentActivity", {
    tableName: "student_activities",
    activity() {
        return this.belongsTo("Activity");
    }
});