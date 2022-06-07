const {bookshelf} = require("../utils/db");
module.exports = bookshelf.model("Class", {
    tableName: "classes",
    major() {
        return this.belongsTo("Major");
    }
});