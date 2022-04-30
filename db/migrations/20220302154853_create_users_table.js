/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("users", (table) => {
        table.bigIncrements().primary();
        table.bigInteger("user_type_id").notNullable().defaultTo(3).references("id").inTable("user_types");
        table.text("username").unique().notNullable();
        table.text("password").notNullable();
        table.text("first_name").notNullable();
        table.text("last_name").notNullable();
        table.text("email").unique().notNullable();
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists("users");
};
