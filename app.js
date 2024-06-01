var createError = require("http-errors");
var express = require("express");
var session = require("express-session");
var MemoryStore = require("memorystore")(session);
var bodyParser = require("body-parser");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var loginRouter = require("./routes/member/login");
var tagRouter = require("./routes/study/tag");
var listRouter = require("./routes/study/list");
var studyRouter = require("./routes/study/study");
var questionRouter = require("./routes/question/question");
var questionLikesRouter = require("./routes/question/question_likes");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// 세션 설정
app.use(
  session({
    secret: "your secret key", // 세션을 암호화하기 위한 비밀키
    resave: false, // 세션을 항상 저장할지 결정 (false 권장)
    saveUninitialized: true, // 초기화되지 않은 세션을 저장소에 저장할지 결정
    store: new MemoryStore({ checkPeriod: 60 * 1000 }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 쿠키 유효기간 (예: 1일)
    },
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/login", loginRouter);
app.use("/tag", tagRouter); // localhost:3000/tag
app.use("/study/list", listRouter);
app.use("/study", studyRouter);
app.use("/question", questionRouter);
app.use("/question/likes", questionLikesRouter);

app.use(function (req, res, next) {
  console.log("404 Error: ", req.url);
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  console.error("Error handler: ", err.stack);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

console.log("Server started");

module.exports = app;
