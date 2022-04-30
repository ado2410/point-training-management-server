/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("activities", (table) => {
        table.bigIncrements().primary();
        table.bigInteger("semester_id").references("id").inTable("semesters");
        table.bigInteger("activity_type_id").references("id").inTable("activity_types").notNullable();
        table.text("code").notNullable().unique();
        table.text("name").notNullable();
        table.date("time_start");
        table.date("time_end");
        table.text("address");
        table.text("host");
        table.text("description");
        table.enum("type", ["CHECK", "COUNT", "ENUM"]).defaultTo("CHECK").notNullable();
        table.specificType("accepts", "text[]");
        table.bigInteger("default_value").defaultTo(0).notNullable();
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists("activities");
};
