var express = require("express");
var router = express.Router();
var db = require("../../util/db");

// 질문 생성
router.post("/", function (req, res) {
  const member_id = req.body.member_id;
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
  const member_id = req.body.member_id;
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
  const member_id = req.body.member_id;
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
  const questionId = req.params.questionId;
  const sqlQuestion = "SELECT * FROM question WHERE question_id = ?";
  const sqlTags = "SELECT t1.tag_id, t1.tag_name FROM tag t1 JOIN study_tag t2 on t1.tag_id = t2.tag_id WHERE t2.study_id = ?";
  const sqlAnswers = `SELECT a.answer_id, a.content, a.created_at, a.member_id, m.nickname 
                      FROM answer a 
                      JOIN member m ON a.member_id = m.member_id 
                      WHERE a.question_id = ?`;

  const sqlComments = `SELECT ac.answer_comment_id, ac.answer_id, ac.member_id, ac.parent_comment_id, ac.content, ac.created_at, m.nickname 
                       FROM answer_comment ac 
                       JOIN member m ON ac.member_id = m.member_id 
                       WHERE ac.answer_id IN (SELECT answer_id FROM answer WHERE question_id = ?) 
                       ORDER BY ac.created_at ASC`;

  db.query(sqlQuestion, [questionId], function (error, questionResults) {

    if (error) {
      res.status(500).send("서버 오류 발생: " + error.message);
      return;
    }
    if (questionResults.length === 0) {
      res.status(404).send("질문을 찾을 수 없습니다.");
      return;
    }

    const studyId = questionResults[0].study_id;

    db.query(sqlTags, [studyId], function (error, tagResults) {
      if (error) {
        res.status(500).send("서버 오류 발생: " + error.message);
        return;
      }


      db.query(sqlAnswers, [questionId], function (error, answerResults) {

        if (error) {
          res.status(500).send("서버 오류 발생: " + error.message);
          return;
        }
        db.query(sqlComments, [questionId], function (error, commentResults) {
          if (error) {
            res.status(500).send("서버 오류 발생: " + error.message);
            return;
          }

          // 각 답변에 대해 댓글을 트리 구조로 구성
          const commentMap = {};
          commentResults.forEach(comment => {
            comment.sub_comment = [];
            commentMap[comment.answer_comment_id] = comment;
          });

          answerResults.forEach(answer => {
            answer.comments = [];
            commentResults.forEach(comment => {
              if (comment.answer_id === answer.answer_id) {
                if (comment.parent_comment_id) {
                  commentMap[comment.parent_comment_id].sub_comment.push(comment);
                } else {
                  answer.comments.push(comment);
                }
              }
            });
          });

          const result = {
            question: questionResults[0],
            tags: tagResults,
            answers: answerResults
          };

          return res.json(result);
        });

      });
    });
  });
});


// 질문 목록 불러오기 (제목 검색)
router.get("/list", function (req, res) {
  var { keyword, tagId, sort, page, perPage } = req.query;

  // 기본값 설정
  page = page ? parseInt(page, 10) : 1;
  perPage = perPage ? parseInt(perPage, 10) : 10;
  const offset = (page - 1) * perPage;

  // 기본 SQL 쿼리
  var sql = `
    select q.question_id, q.title, q.content, q.study_id, 
    q.created_at, m.member_id, m.nickname, count(l.question_likes_id) as 'likes_count'
    from question q 
    join member m on q.member_id = m.member_id 
    left join question_likes l on q.question_id = l.question_id 
  `;
  var params = [];

  // 태그 필터링
  if (tagId) {
    sql += `left join study_tag st on q.study_id = st.study_id where st.tag_id = ? `;
    params.push(tagId);

    if (keyword) {
      sql += `and q.title like ? `;
      params.push(`%${keyword}%`);
    }
  } else {
    if (keyword) {
      sql += `where q.title like ? `;
      params.push(`%${keyword}%`);
    }
  }

  // 그룹화 및 정렬
  sql += "group by q.question_id ";

  if (sort === "latest") {
    sql += ` ORDER BY q.created_at DESC `;
  } else {
    sql += ` ORDER BY q.created_at ASC `;
  }

  // 페이징 처리
  sql += ` LIMIT ?, ? `;
  params.push(offset, perPage);

  // 데이터베이스 쿼리 실행
  db.query(sql, params, (error, questions) => {
    if (error) {
      console.error("검색 중 오류 발생:", error);
      return res.status(500).json({ error: "검색 중 오류가 발생했습니다." });
    }

    if (questions.length === 0) {
      return res.json([]);
    }

    const questionIds = questions.map(q => q.study_id);
    const tagQuery = `
    SELECT st.study_id, t.tag_id, t.tag_name
    FROM study_tag st
    JOIN tag t ON t.tag_id = st.tag_id
    WHERE st.study_id IN (?)
`;

    db.query(tagQuery, [questionIds], (tagError, tags) => {
      if (tagError) {
        console.error("태그 조회 중 오류 발생:", tagError);
        return res.status(500).json({ error: "태그 조회 중 오류가 발생했습니다." });
      }

      const tagMap = tags.reduce((acc, tag) => {
        if (!acc[tag.study_id]) {
          acc[tag.study_id] = [];
        }
        acc[tag.study_id].push({ tag_id: tag.tag_id, tag_name: tag.tag_name });
        return acc;
      }, {});

      const results = questions.map(question => ({
        ...question,
        tags: tagMap[question.study_id] || []
      }));

      res.json(results);
    });
  });
});


module.exports = router;
