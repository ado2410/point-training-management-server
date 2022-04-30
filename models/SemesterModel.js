const {bookshelf} = require("../utils/db");
module.exports = bookshelf.model("Semester", {
    tableName: "semesters",
    year() {
        return this.belongsTo("Year");
    }
});