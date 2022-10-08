require("dotenv").config();

module.exports = {
    client: "pg",
    connection: {
        connectionString: process.env.DB_URL,
        ssl: {
            require: true,
            rejectUnauthorized: false
          }
    },
    searchPath: ["knex", "public"],
    migrations: {
        directory: "./db/migrations",
    },
    seeds: {
        directory: "./db/seeds",
    },
};
