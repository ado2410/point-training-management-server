/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("student_activities", (table) => {
        table.bigIncrements().primary();
        table.bigInteger("student_id").references("id").inTable("students").notNullable();
        table.bigInteger("activity_id").references("id").inTable("activities").notNullable().onDelete("CASCADE");
        table.float("value").notNullable();
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists("student_activities");
};
