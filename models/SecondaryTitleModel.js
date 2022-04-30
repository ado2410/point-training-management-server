const {bookshelf} = require("../utils/db");
module.exports = bookshelf.model("SecondaryTitle", {
    tableName: "secondary_titles",
    third_titles() {
        return this.hasMany('ThirdTitle');
    }
});