import Knex from "knex";
import Bookshelf from "bookshelf";

export const db = Knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DB_URL,
        ssl: false,
        timezone: "UTC",
    },
    searchPath: ['knex', 'public'],
});

export const bookshelf = Bookshelf(db as any);