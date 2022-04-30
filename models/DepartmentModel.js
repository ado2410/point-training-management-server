const {bookshelf} = require("../utils/db");
module.exports = bookshelf.model("Department", {
    tableName: "departments",
    majors() {
        return this.hasMany('Major');
    }
});