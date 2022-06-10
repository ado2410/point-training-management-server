/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("title_activities", (table) => {
        table.bigIncrements().primary();
        table.bigInteger("third_title_id").references("id").inTable("third_titles").notNullable();
        table.bigInteger("activity_id").references("id").inTable("activities").notNullable().onDelete("CASCADE");
        table.bigInteger("semester_id").references("id").inTable("semesters").notNullable().onDelete("CASCADE");
        table.specificType("point", "float[]").notNullable();
        table.specificType("options", "jsonb[]");
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists("title_activities");
};
