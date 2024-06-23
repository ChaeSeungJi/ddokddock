// express 모듈과 라우터 설정
const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require("../../util/db");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'public/images/');
  },
  filename: function (req, file, cb) {
      cb(null, req.session.member_id + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'image_url') {
      cb(null, true);
    } else {
      cb(new Error('Unexpected field'));
    }
  }
});

// study 생성 함수
function createStudy(title, content, leader_id, studyImagePath, status, callback) {
  const sql = "INSERT INTO study (title, content, leader_id, created_at, image_url, status) VALUES (?, ?, ?, NOW(), ?, ?)";
  const params = [title, content, leader_id, studyImagePath, status];

  db.query(sql, params, (error, results) => {
    if (error) return callback(error);
    if (results.affectedRows > 0) return callback(null, results.insertId);
    return callback(new Error("스터디 생성 실패"));
  });
}

// study 수정 함수
function updateStudy(studyId, title, content, callback) {
  const sql = "update study set title = ?, content = ? where study_id = ?";
  const params = [title, content, studyId];

  db.query(sql, params, (error, results) => {
    if (error) {
      console.log("error");
      return callback(error);
    }
    if (results.affectedRows > 0) return callback(null, studyId);
    return callback(new Error("스터디 수정"));
  });
}

// study 수정 함수
function deleteStudy(studyId, callback) {
  const sql = "delete from study where study_id = ?";
  const params = [studyId];
  console.log(studyId);
  db.query(sql, params, (error, results) => {
    if (error) return callback(error);
    if (results.affectedRows > 0) return callback(null);
    return callback(new Error("스터디 삭제"));
  });
}

// curriculum 추가 함수
function addCurriculum(curriculum_list, study_id, callback) {
  const sql = "INSERT INTO curriculum VALUES (NULL, ?, ?, ?)";
  let completed = 0;
  let hasError = false;

  // 커리큘럼 리스트가 비어있는 경우
  if (curriculum_list.length === 0) {
    return callback(null);
  }

  curriculum_list.forEach((item, index) => {
    const params = [item.order, item.title, study_id];
    db.query(sql, params, error => {
      if (hasError) return; // 이미 에러가 발생한 경우 추가 처리 중단

      if (error) {
        hasError = true;
        return callback(error);
      }

      completed++;

      // 모든 쿼리가 완료되었는지 확인
      if (completed === curriculum_list.length) {
        callback(null);
      }
    });
  });
}

// curriculum 수정함수
function updateCurriculum(curriculum_list, study_id, callback) {
  const sql =
    "update curriculum set curriculum_no = ?, content = ? where study_id = ? ";

  curriculum_list.forEach((item, index) => {
    const params = [index + 1, item, study_id];
    db.query(sql, params, error => {
      if (error) {
        console.log(error.message);
        return callback(error);
      }
    });
  });

  callback(null);
}

// curriculum 삭제함수
function deleteCurriculum(study_id, callback) {
  const sql = "delete from curriculum where study_id = ?";

  const params = [study_id];
  db.query(sql, params, error => {
    if (error) return callback(error, study_id);
  });

  callback(null, study_id);
}

// 스터디 생성
router.post("/", upload.single('image_url'), (req, res) => {
  const { title, content, status } = req.body;
  const leader_id = req.session.member_id;
  const studyImagePath = req.file ? `/study_image/${req.file.filename}` : null;

  if (!leader_id) {
    return res.status(401).send("로그인이 필요합니다.");
  }

  let curriculumData = [];
  if (Array.isArray(req.body.curriculum)) {
    for (let i = 0; i < req.body.curriculum.length; i += 2) {
      const order = req.body.curriculum[i];
      const title = req.body.curriculum[i + 1];
      if (order && title) {
        curriculumData.push({ order, title });
      }
    }
  }

  if (curriculumData.length === 0) {
    return res.status(400).send("커리큘럼 데이터가 비어있습니다.");
  }

  db.beginTransaction(err => {
    if (err) {
      return res.status(500).send("트랜잭션 시작 오류: " + err.message);
    }

    createStudy(title, content, leader_id, studyImagePath, status, (error, study_id) => {
      if (error) {
        return db.rollback(() => {
          res.status(500).send("스터디 생성 오류: " + error.message);
        });
      }

      addCurriculum(curriculumData, study_id, error => {
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


// 스터디 수정 localhost:3000/study/update
router.post("/update", function (req, res) {
  const { studyId, title, content, curriculum, leaderId } = req.body;
  const leader_id = req.session.member_id;

  if (!leader_id) {
    return res.status(401).send("로그인이 필요합니다.");
  }

  if (leader_id == leaderId) {
    return res.status(400).send("스터디 수정 권한이 없습니다.");
  }

  db.beginTransaction(err => {
    if (err) {
      return res.status(500).send("트랜잭션 시작 오류: " + err.message);
    }

    updateStudy(studyId, title, content, (error, study_id) => {
      if (error) {
        return db.rollback(() => {
          res.status(500).send("스터디 수정 오류: " + error.message);
        });
      }
      updateCurriculum(curriculum, study_id, error => {
        if (error) {
          return db.rollback(() => {
            res.status(500).send("커리큘럼 수정 오류: " + error.message);
          });
        }

        db.commit(err => {
          if (err) {
            return db.rollback(() => {
              res.status(500).send("트랜잭션 커밋 오류: " + err.message);
            });
          }

          res.status(200).send("스터디 수정 성공");
        });
      });
    });
  });
});

// localhost:3000/study/delete
router.post("/delete", function (req, res) {
  const { studyId, leaderId } = req.body;

  var leader_id = req.session.member_id;

  if (!leader_id) {
    return res.status(401).send("로그인이 필요합니다.");
  }

  if (leader_id == leaderId) {
    return res.status(400).send("스터디 삭제 권한이 없습니다.");
  }

  db.beginTransaction(err => {
    if (err) {
      return res.status(500).send("트랜잭션 시작 오류: " + err.message);
    }

    deleteCurriculum(studyId, (error, study_id) => {
      if (error) {
        return db.rollback(() => {
          res.status(500).send("커리큘럼 삭제 오류: " + error.message);
        });
      }

      deleteStudy(study_id, error => {
        if (error) {
          return db.rollback(() => {
            res.status(500).send("스터디 삭제 오류: " + error.message);
          });
        }

        db.commit(err => {
          if (err) {
            return db.rollback(() => {
              res.status(500).send("트랜잭션 커밋 오류: " + err.message);
            });
          }

          res.status(200).send("스터디 삭제 성공");
        });
      });
    });
  });
});

module.exports = router;
