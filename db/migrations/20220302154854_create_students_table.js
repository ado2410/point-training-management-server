/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("students", (table) => {
        table.bigIncrements().primary();
        table.bigInteger("user_id").references("id").inTable("users").notNullable();
        table.bigInteger("class_id").references("id").inTable("classes").notNullable();
        table.text("student_code").unique().notNullable();
        table.text("gender").notNullable();
        table.text("dob").notNullable();
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists("students");
};
