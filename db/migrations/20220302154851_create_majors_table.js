/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("majors", (table) => {
        table.increments().primary();
        table.bigInteger("department_id").references("id").inTable("departments").notNullable();
        table.text("name").notNullable().unique();
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists("majors");
};
