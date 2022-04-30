const {bookshelf} = require("../utils/db");
module.exports = bookshelf.model("Year", {
    tableName: "years",
});