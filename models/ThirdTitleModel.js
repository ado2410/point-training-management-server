const {bookshelf} = require("../utils/db");
module.exports = bookshelf.model("ThirdTitle", {
    tableName: "third_titles",
    title_activities() {
        return this.hasMany('TitleActivity');
    }
});