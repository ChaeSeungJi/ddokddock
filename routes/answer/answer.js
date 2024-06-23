const express = require("express");
const router = express.Router();
const db = require("../../util/db");

// 답변 생성하기
router.post("/", (req, res) => {
  const member_id = req.body.member_id;
  const questionId = req.body.questionId;
  const content = req.body.content;

  var sql = `insert into answer values(NULL, '${content}' ,now(), ${questionId}, ${member_id})`;

  if (!member_id) {
    return res.status(403).send("로그인 후 사용해주세요");
  }

  db.query(sql, function (error, result) {
    if (error) {
      res.status(500).send("서버 오류 발생" + error.message);
      return;
    }
    if (result.affectedRows > 0) {
      res.status(200).send("질문 추가 완료");
    }
  });
});

// 답변 수정하기
router.post("/update", (req, res) => {
  const member_id = req.body.member_id;
  const answerId = req.body.answerId;
  const content = req.body.content;
  const memberId = req.body.memberId;

  var sql = `update answer set content = '${content}' where answer_id = ${answerId}`;

  if (!member_id) {
    return res.status(403).send("로그인 후 사용해주세요");
  }

  if (memberId != member_id) {
    return res.status(403).send("답변 수정할 권한이 없습니다.");
  }

  db.query(sql, function (error, result) {
    if (error) {
      res.status(500).send("서버 오류 발생" + error.message);
      return;
    }
    if (result.affectedRows > 0) {
      res.status(200).send("질문 수정 완료");
    }
  });
});

// 답변 삭제하기
router.post("/delete", function (req, res) {
  const member_id = req.body.member_id;
  const answerId = req.body.answerId;
  const memberId = req.body.memberId;

  if (!member_id) {
    return res.status(403).send("로그인 후 사용해주세요");
  }

  if (memberId != member_id) {
    return res.status(403).send("삭제 권한이 없습니다.");
  }

  var sql = "delete from answer where answer_id = ?";

  db.query(sql, answerId, function (error, results) {
    if (error) {
      res.status(500).send("서버 오류 발생" + error.message);
      return;
    }
    if (results.affectedRows > 0) {
      res.status(200).send("답변 삭제 완료");
    }
  });
});

// 답변 좋아요 추가 / 제거

// 좋아요 추가 / 제거
router.post("/likes/:answerId", function (req, res) {
  const member_id = req.body.member_id;
  if (!member_id) {
    res.status(400).send("로그인 후 사용해주세요");
    return;
  }
  const answerId = req.params.answerId;

  var sql = "select * from answer_likes where answer_id = ? and member_id = ?";
  const params = [answerId, member_id];

  db.query(sql, params, function (error, results) {
    if (error) {
      res.status(500).send("서버 오류 발생" + error.message);
      return;
    }
    // 좋아요 추가가 되어있는 경우
    if (results.length > 0) {
      var deleteSql =
        "delete from answer_likes where answer_id = ? and member_id = ?";
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
      var insertSql = "insert into answer_likes values(NULL, ?, ?)";

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
