/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("semesters", (table) => {
        table.bigIncrements().primary();
        table.bigInteger("year_id").references("id").inTable("years").notNullable();
        table.text("name").notNullable();
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists("semesters");
};
