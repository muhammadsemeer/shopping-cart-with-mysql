var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var hbs = require("express-handlebars");
var fileUpload = require("express-fileupload");
var db = require("./config/connection");
var session = require("express-session");
var adminRouter = require("./routes/admin");
var usersRouter = require("./routes/users");

var app = express();
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.engine(
    "hbs",
    hbs({
        extname: "hbs",
        defaultLayout: "layout",
        layoutsDir: __dirname + "/views/layout/",
        partialsDir: __dirname + "/views/partials/",
        helpers: {
            ifNotPaid: function (payment, options) {
                if (payment === 0) {
                    return options.fn(this);
                } else {
                    return options.inverse(this);
                }
            },
            ifPaid: function (payment, options) {
                if (payment === 1) {
                    return options.fn(this);
                } else {
                    return options.inverse(this);
                }
            },
        },
    })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(fileUpload());
app.use(session({ secret: "key", cookie: { maxAge: 2592000000 } }));

// Add your routes here, etc.

function haltOnTimedout(req, res, next) {
    if (!req.timedout) next();
}
var connect = require("./config/reconnect");
db.getConnection((err) => {
    if (err) {
        console.log("error when connecting to db:", err.code);
        setTimeout(connect, 1000);
    } else {
        console.log("Database connected", "Connection.js");
    }
});
db.on("error", (err) => {
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

app.use("/", usersRouter);
app.use("/admin", adminRouter);

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//     next(createError(404));
// });

app.use("*", (req, res) => {
<<<<<<< HEAD
    res.status(404).render("404.hbs", {
        user: req.session.user,
        admin: req.session.user.admin,
    });
=======
    res.status(404).render("404.hbs");
>>>>>>> deploy
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;
