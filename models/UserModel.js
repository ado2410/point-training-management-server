const {bookshelf} = require("../utils/db");
module.exports = bookshelf.model("User", {
    tableName: "users",
    hidden: ["password"],
    user_type() {
        return this.belongsTo("UserType");
    }
});