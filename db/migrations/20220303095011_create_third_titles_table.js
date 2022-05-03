/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("third_titles", (table) => {
        table.bigIncrements().primary();
        table.bigInteger("secondary_title_id").references("id").inTable("secondary_titles").notNullable();
        table.integer("order").notNullable();
        table.text("title").notNullable();
        table.float("max_point").notNullable();
        table.float("default_point").defaultTo(0).notNullable();
        table.text("description");
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists("third_titles");
};
