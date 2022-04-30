const knex = require("knex");

const db = knex.knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DB_URL,
        ssl: false,//{ rejectUnauthorized: false }
    },
    searchPath: ['knex', 'public'],
});

const bookshelf = require("bookshelf")(db);

module.exports = {
    db: db,
    bookshelf: bookshelf,
};