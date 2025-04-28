const { Client } = require('pg');

exports.getClient = () => {
  return new Client({
    host: process.env.DB_HOSTNAME,
    port: 5432,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
};
