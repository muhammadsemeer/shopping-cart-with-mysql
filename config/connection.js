const mysql = require("mysql");
require("dotenv").config();
var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB,
});

module.exports = connection;
