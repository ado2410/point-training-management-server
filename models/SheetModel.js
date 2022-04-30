const {bookshelf} = require("../utils/db");
module.exports = bookshelf.model("Sheet", {
    tableName: "sheets",
    semester() {
        return this.belongsTo("Semester");
    }

});