require("dotenv").config();

module.exports = {
    development: {
        client: "pg",
        connection: {
            connectionString: process.env.DB_URL,
            ssl: false,
        },
        searchPath: ["knex", "public"],
        migrations: {
            directory: "./db/migrations",
        },
        seeds: {
            directory: "./db/seeds",
        },
    },
};
