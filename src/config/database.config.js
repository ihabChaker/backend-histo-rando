require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'historando',
    password: process.env.DB_PASSWORD || 'historando_password',
    database: process.env.DB_DATABASE || 'historando_db',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  },
  test: {
    username: process.env.DB_USERNAME || 'historando',
    password: process.env.DB_PASSWORD || 'historando_password',
    database: process.env.DB_DATABASE_TEST || 'historando_db_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  },
};
