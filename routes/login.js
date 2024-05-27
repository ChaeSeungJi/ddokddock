var express = require("express");
var router = express.Router();
var db = require("../util/db");

// /login-get? , 얘는 필요한가..?
router.get("/", function (req, res) {
  console.log("test");
});

// login-post
router.post("/", function (req, res) {
  var login_id = req.body.loginid;
  var password = req.body.password;

  var sql = "select * from member where login_id = ? and password = ?";
  var params = [login_id, password];

  db.query(sql, params, function (error, results) {
    if (error) {
      res.status(500).send("서버 오류 발생" + error.message);
      return;
    }
    if (results.length > 0) {
      res.send(results);
      req.session.member_id = results[0].member_id;
      console.log(req.session.member_id);
      req.session.save(); // save를 해줘야 세션에 저장됨.
    } else {
      res.send("로그인 실패");
    }
  });
});

// 회원가입 페이지 /login/sign-up
router.post("/sign-up", function (req, res) {
  var login_id = req.body.loginid;
  var password = req.body.password;
  var nickname = req.body.nickname;

  var sql = "insert into member values( NULL, ?,?,?)";
  var params = [login_id, password, nickname];

  db.query(sql, params, function (error, results) {
    if (error) {
      res.status(500).send("서버오류 : " + error.message);
      return;
    } else {
      if (results.affectedRows > 0) {
        res.status(200).send("회원가입 성공");
      } else {
        res.status(400).send("회원가입 실패, 입력 데이터를 확인해주세요");
      }
    }
  });
});

module.exports = router;
