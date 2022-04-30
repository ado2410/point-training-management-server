/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("sheets", (table) => {
        table.bigIncrements().primary();
        table.bigInteger("semester_id").references("id").inTable("semesters");
        table.text("name").notNullable();
        table.text("description");
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists("sheets");
};
