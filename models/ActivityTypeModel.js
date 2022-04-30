const {bookshelf} = require("../utils/db");
module.exports = bookshelf.model("ActivityType", {
    tableName: "activity_types",
});