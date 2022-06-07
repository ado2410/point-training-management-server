const {bookshelf} = require("../utils/db");
module.exports = bookshelf.model("Major", {
    tableName: "majors",
    classes() {
        return this.hasMany('Class');
    },
    department() {
        return this.belongsTo("Department");
    }
});