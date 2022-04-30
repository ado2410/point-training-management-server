const {bookshelf} = require("../utils/db");
module.exports = bookshelf.model("TitleActivity", {
    tableName: "title_activities",
    activity() {
        return this.belongsTo("Activity");
    }
});