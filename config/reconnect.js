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
            console.log("Database connected", con.threadId);
        }
    });
    con.on("error", (err) => {
        console.log("db error", err);
        if (err.code === "PROTOCOL_CONNECTION_LOST") {
            connect();
            // Connection to the MySQL server is usually
            // lost due to either server restart, or a
        } else {
            // connnection idle timeout (the wait_timeout
            throw err;
        }
    });
};

module.exports = connection;
