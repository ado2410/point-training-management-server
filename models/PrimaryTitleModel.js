const {bookshelf} = require("../utils/db");
module.exports = bookshelf.model("PrimaryTitle", {
    tableName: "primary_titles",
    secondary_titles() {
        return this.hasMany('SecondaryTitle');
    }
});