const mysql = require("mysql");
const connection = () => {
    var connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB,
    });
    connection.connect((err) => {
        if (err) {
            console.log("error when connecting to db:");
            setTimeout(connection, 1000);
        } else {
            console.log("Database connected");
        }
    });
};

module.exports = connection;
