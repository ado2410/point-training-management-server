/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("secondary_titles", (table) => {
        table.bigIncrements().primary();
        table.bigInteger("primary_title_id").references("id").inTable("primary_titles").notNullable();
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
    return knex.schema.dropTableIfExists("secondary_titles");
};
