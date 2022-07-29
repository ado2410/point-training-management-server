/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("group_users", (table) => {
        table.bigIncrements().primary();
        table.bigInteger("user_id").notNullable().references("id").inTable("users");
        table.bigInteger("group_id").notNullable().references("id").inTable("groups").onDelete("CASCADE");
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists("group_users");
};
