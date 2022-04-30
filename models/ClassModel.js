const {bookshelf} = require("../utils/db");
module.exports = bookshelf.model("Class", {
    tableName: "classes",
});