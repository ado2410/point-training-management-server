const {bookshelf} = require("../utils/db");
module.exports = bookshelf.model("Activity", {
    tableName: "activities",
    activity_type() {
        return this.belongsTo("ActivityType");
    },
    student_activities() {
        return this.hasMany('StudentActivity');
    },
    student_activity() {
        return this.hasOne('StudentActivity');
    },
    semester() {
        return this.belongsTo('Semester');
    }
});