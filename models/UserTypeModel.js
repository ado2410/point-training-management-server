const {bookshelf} = require("../utils/db");
module.exports = bookshelf.model("UserType", {
    tableName: "user_types",
    users() {
        return this.hasMany("User");
    }
});