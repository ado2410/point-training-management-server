/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("primary_titles", (table) => {
        table.bigIncrements().primary();
        table.integer("order").notNullable();
        table.text("title").notNullable();
        table.text("description");
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists("primary_titles");
};
