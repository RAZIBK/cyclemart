const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const flash = require("connect-flash");
const multer = require("multer");
const indexRouter = require("./routes/index");
const adminRouter = require("./routes/admin");
const hbs = require("express-handlebars");
const { session } = require("express-session");
const Session = require("express-session");
const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.engine(
  "hbs",
  hbs.engine({
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: __dirname + "/views/layout/", //layout folder route setting
    partialsDir: __dirname + "/views/partials", //partials folder route setting
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(Session({ secret: "Key", cookie: { maxAge: 600000 } }));
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
app.use(flash());
//app.use(fileUpload())
app.use("/", indexRouter);
app.use("/admin", adminRouter);
// app.use('*/', indexRouter);

// catch 404 and forward to error handler
app.use("*",function (req, res, next) {
  // next(createError(404));
  res.render('error')

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
