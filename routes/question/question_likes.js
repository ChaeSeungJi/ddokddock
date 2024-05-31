var express = require("express");
var router = express.Router();
var db = require("../../util/db");
const { route } = require("./question");

// 좋아요 추가 / 제거
router.post("/:questionId", function (req, res) {
  const member_id = req.session.member_id;
  if (!member_id) {
    res.status(400).send("로그인 후 사용해주세요");
    return;
  }
  const questionId = req.params.questionId;

  var sql =
    "select * from question_likes where question_id = ? and member_id = ?";
  const params = [questionId, member_id];

  db.query(sql, params, function (error, results) {
    if (error) {
      res.status(500).send("서버 오류 발생" + error.message);
      return;
    }
    // 좋아요 추가가 되어있는 경우
    if (results.length > 0) {
      var deleteSql =
        "delete from question_likes where question_id = ? and member_id = ?";
      db.query(deleteSql, params, function (error, results) {
        if (error) {
          res.status(500).send("삭제 중 오류 발생" + error.message);
          return;
        }
        if (results.affectedRows > 0) {
          res.status(200).send("좋아요 삭제");
        }
      });
    }
    // 좋아요 추가가 안 되어있는 경우
    else {
      var insertSql = "insert into question_likes values(NULL, ?, ?)";

      db.query(insertSql, params, function (error, results) {
        if (error) {
          res.status(500).send("서버 오류 발생" + error.message);
          return;
        }
        if (results.affectedRows > 0) {
          res.status(200).send("좋아요 추가");
        }
      });
    }
  });
});

module.exports = router;
