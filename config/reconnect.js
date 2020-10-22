const mysql = require("mysql");
const connection = () => {
    var con = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB,
    });
    con.connect((err) => {
        if (err) {
            console.log("error when connecting to db:", err.code);
            setTimeout(connection, 1000);
        } else {
            console.log("Database connected",  db.threadId);
        }
    });
};

module.exports = connection;
