var express = require("express");
var router = express.Router();
var db = require("../../util/db");

// 질문 생성
router.post("/", function (req, res) {
  const member_id = req.session.member_id;
  const { title, content, studyId } = req.body;

  if (!member_id) {
    res.status(400).send("로그인 후 사용해주세요");
  }

  var sql = "insert into question values(NULL, ?, ?, ?, ?, now() )";
  var params = [title, content, member_id, studyId];

  db.query(sql, params, function (error, results) {
    if (error) {
      res.status(500).send("서버 오류 발생" + error.message);
      return;
    }
    if (results.affectedRows > 0) {
      res.status(200).send("질문 작성 성공");
    } else {
      res.send("질문 작성 실패");
    }
  });
});

// 질문 수정하기
router.post("/update", function (req, res) {
  const member_id = req.session.member_id;
  const { questionId, title, content, memberId, studyId } = req.body;

  if (memberId != member_id) {
    return res.status(403).send("수정 권한이 없습니다.");
  }

  var sql =
    "update question set " + "title = ?, content = ? where question_id = ?";
  var params = [title, content, questionId];

  db.query(sql, params, function (error, results) {
    if (error) {
      res.status(500).send("서버 오류 발생" + error.message);
      return;
    }
    if (results.affectedRows > 0) {
      res.status(200).send("질문 수정 완료");
    }
  });
});

// 질문 삭제하기
router.post("/delete", function (req, res) {
  const member_id = req.session.member_id;
  const questionId = req.body.questionId;
  const memberId = req.body.memberId;

  console.log(member_id);
  if (memberId != member_id) {
    return res.status(403).send("삭제 권한이 없습니다.");
  }

  var sql = "delete from question where question_id = ?";

  db.query(sql, questionId, function (error, results) {
    if (error) {
      res.status(500).send("서버 오류 발생" + error.message);
      return;
    }
    if (results.affectedRows > 0) {
      res.status(200).send("질문 삭제 완료");
    }
  });
});

// 단일 질문 불러오기
router.get("/id/:questionId", function (req, res) {
  var questionId = req.params.questionId;
  var sqlQuestion = "select * from question where question_id = ?";
  var sqlTags =
    "select t1.tag_id, t1.tag_name from tag t1 join study_tag t2 on t1.tag_id = t2.tag_id where t2.study_id = ?";

  var sqlAnswers = `select a.answer_id, a.content, a.created_at, a.member_id, m.nickname 
  from answer a 
  join member m on a.member_id = m.member_id  where question_id = '${questionId}' `;
  db.query(sqlQuestion, questionId, function (error, questionResults) {
    if (error) {
      res.status(500).send("서버 오류 발생: " + error.message);
      return;
    }
    if (questionResults.length === 0) {
      res.status(404).send("질문을 찾을 수 없습니다.");
      return;
    }

    var studyId = questionResults[0].study_id;

    db.query(sqlTags, studyId, function (error, tagResults) {
      if (error) {
        res.status(500).send("서버 오류 발생: " + error.message);
        return;
      }

      db.query(sqlAnswers, function (error, answerResult) {
        if (error) {
          res.status(500).send("서버 오류 발생: " + error.message);
          return;
        }
        const result = {
          question: questionResults[0],
          tags: tagResults,
          answers: answerResult,
        };

        return res.json(result);
      });
    });
  });
});

// 질문 목록 불러오기 (제목 검색)
router.get("/list", function (req, res) {
  var { keyword, tagId, sort, page, perPage } = req.query; //페이징처리

  if (!page || !perPage) {
    page = 1;
    perPage = 10;
  }
  const offset = (page - 1) * perPage;

  var sql = `
  select q.question_id, q.title, q.content, q.study_id, 
  q.created_at, m.member_id, m.nickname, count(l.question_likes_id) as 'likes_count'
  from question q 
  join member m on q.member_id = m.member_id 
  left join question_likes l on q.question_id = l.question_id `;

  if (tagId) {
    sql += `left join study_tag st on q.study_id = st.study_id where st.tag_id = ${tagId} `;
    if (keyword) {
      sql += `and q.title like '%${keyword}%' `;
    }
  } else {
    if (keyword) {
      sql += `where q.title like '%${keyword}%' `;
    }
  }

  sql += "group by q.question_id ";

  if (sort === "latest") {
    sql += ` ORDER BY q.created_at DESC `;
  } else {
    sql += ` ORDER BY q.created_at ASC `;
  }

  sql += ` LIMIT ${offset}, ${perPage} `;

  db.query(sql, (error, results) => {
    if (error) {
      console.error("검색 중 오류 발생:", error);
      res.status(500).json({ error: "검색 중 오류가 발생했습니다." });
    } else {
      res.json(results);
    }
  });
});

module.exports = router;
