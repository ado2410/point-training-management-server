/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("semester_students", (table) => {
        table.bigIncrements().primary();
        table.bigInteger("semester_id").references("id").inTable("semesters").notNullable().onDelete("CASCADE");
        table.bigInteger("student_id").references("id").inTable("students").notNullable();
        table.enum("position", ["CLASS_MONITOR", "CLASS_VICE", "SECRETARY", "UNDERSECRETARY", "COMMISSIONER", "MEMBER"]).defaultTo("MEMBER").notNullable();
        table.float("point").defaultTo(0).notNullable();
        table.timestamps(true, true);
        table.unique(["semester_id", "student_id"]);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists("semester_students");
};
