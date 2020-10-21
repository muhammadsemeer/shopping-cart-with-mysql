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
    })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(fileUpload());
app.use(session({ secret: "key", cookie: { maxAge: 2592000000 } }));

const connection = () => {
    db.connect((err) => {
        if (err) {
            console.log('error when connecting to db:', err.code);
            setTimeout(connection, 2000)
        };
        console.log("Database connected");
    });
    db.on("error", (err) => {
        console.log("db error", err);
        if (err.code === "PROTOCOL_CONNECTION_LOST") {
            // Connection to the MySQL server is usually
            db.connect((err) => {
                if (err) throw err;
                console.log("Database connected");
            }); // lost due to either server restart, or a
    } else {
        // connnection idle timeout (the wait_timeout
        throw err; // server variable configures this)
    }
});
}
app.use("/", usersRouter);
app.use("/admin", adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
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
