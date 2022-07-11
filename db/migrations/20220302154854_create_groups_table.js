/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("groups", (table) => {
        table.bigIncrements().primary();
        table.bigInteger("group_id").references("id").inTable("groups").onDelete("CASCADE");
        table.text("code").notNullable();
        table.text("name").notNullable();
        table.jsonb("settings");
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists("groups");
};
