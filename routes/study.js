// express 모듈과 라우터 설정
const express = require("express");
const router = express.Router();
const db = require("../util/db");

// study 생성 함수
function createStudy(title, content, leader_id, callback) {
  const sql = "INSERT INTO study VALUES (NULL, ?, ?, ?, NOW())";
  const params = [title, content, leader_id];

  db.query(sql, params, (error, results) => {
    if (error) return callback(error);
    if (results.affectedRows > 0) return callback(null, results.insertId);
    return callback(new Error("스터디 생성 실패"));
  });
}

// curriculum 추가 함수
function addCurriculum(curriculum_list, study_id, callback) {
  const sql = "INSERT INTO curriculum VALUES (NULL, ?, ?, ?)";

  curriculum_list.forEach((item, index) => {
    const params = [index + 1, item, study_id];
    db.query(sql, params, error => {
      if (error) return callback(error);
    });
  });

  callback(null);
}

router.post("/", (req, res) => {
  const { title, content, curriculum } = req.body;
  const leader_id = req.session.member_id;

  if (!leader_id) {
    return res.status(401).send("로그인이 필요합니다.");
  }

  db.beginTransaction(err => {
    if (err) {
      return res.status(500).send("트랜잭션 시작 오류: " + err.message);
    }

    createStudy(title, content, leader_id, (error, study_id) => {
      if (error) {
        return db.rollback(() => {
          res.status(500).send("스터디 생성 오류: " + error.message);
        });
      }

      addCurriculum(curriculum, study_id, error => {
        if (error) {
          return db.rollback(() => {
            res.status(500).send("커리큘럼 추가 오류: " + error.message);
          });
        }

        db.commit(err => {
          if (err) {
            return db.rollback(() => {
              res.status(500).send("트랜잭션 커밋 오류: " + err.message);
            });
          }

          res.status(200).send("스터디 생성 성공");
        });
      });
    });
  });
});

module.exports = router;
