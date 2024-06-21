const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const db = require('../../util/db');

router.use(express.urlencoded({ extended: true }));

router.post('/post', (req, res) => {
    const member_id = req.session.member_id;
    const { title, content, studyId } = req.body;

    if (!member_id) {
        res.status(400).send("로그인 후 사용해주세요");
        return;
    }

    // 리더인지 확인하는 쿼리
    const leaderQuery = `
        SELECT * FROM study WHERE study_id = ? AND leader_id = ?
    `;

    db.query(leaderQuery, [studyId, member_id], (error, results) => {
        if (error) {
            res.status(500).send("서버 오류 발생: " + error.message);
            return;
        }

        if (results.length === 0) {
            res.status(403).send("공지사항 작성 권한이 없습니다");
            console.log("사용자 ID:", member_id, "스터디 ID:", studyId); // 로그 추가
            return;
        }

        const query = `
            INSERT INTO notice (title, content, created_at, member_id, study_id)
            VALUES (?, ?, NOW(), ?, ?)
        `;

        db.query(query, [title, content, member_id, studyId], (error, results) => {
            if (error) {
                res.status(500).send("서버 오류 발생: " + error.message);
                return;
            }
            if (results.affectedRows > 0) {
                const notice_id = results.insertId;
                res.status(200).json({ message: "공지사항 생성 성공", notice_id: notice_id });
            } else {
                res.send("공지사항 생성 실패");
            }
        });
    });
});

// 공지사항 수정
router.put('/update', (req, res) => {
    const member_id = req.session.member_id;
    const { noticeId, title, content } = req.body;

    const query = 'UPDATE notice SET title = ?, content = ? WHERE notice_id = ? AND member_id = ?';
    const params = [title, content, noticeId, member_id];

    db.query(query, params, (error, results) => {
        if (error) {
            console.error('공지사항 수정 중 오류 발생:', error);
            res.status(500).send("서버 오류 발생: " + error.message);
            return;
        }

        if (results.affectedRows > 0) {
            res.status(200).send("공지사항 수정 완료");
        } else {
            res.status(403).send("수정 권한이 없거나 공지사항이 존재하지 않습니다.");
        }
    });
});

// 공지사항 목록 조회
router.get('/list', (req, res) => {
    const { sort, page, perPage } = req.query;

    const pageNumber = parseInt(page) || 1;
    const limit = parseInt(perPage) || 10;

    const offset = (pageNumber - 1) * limit;

    let query = `
        SELECT n.notice_id, n.title, n.content, n.created_at, m.nickname
        FROM notice n
        JOIN member m ON n.member_id = m.member_id
    `;

    if (sort === 'latest') {
        query += ' ORDER BY n.created_at DESC';
    } else {
        query += ' ORDER BY n.created_at ASC';
    }

    query += ' LIMIT ?, ?';

    const params = [offset, limit];

    db.query(query, params, (error, results) => {
        if (error) {
            res.status(500).send("서버 오류 발생: " + error.message);
            return;
        }
        res.status(200).json(results);
    });
});

// 삭제
router.delete('/delete', (req, res) => {
    const member_id = req.session.member_id;
    const noticeId = req.body.noticeId;

    if (!member_id) {
        res.status(401).send("로그인이 필요합니다.");
        return;
    }

    const query = 'SELECT * FROM notice WHERE notice_id = ?';
    const params = [noticeId];

    db.query(query, params, (error, results) => {
        if (error) {
            console.error('공지사항 조회 중 오류 발생:', error);
            res.status(500).send("서버 오류 발생: " + error.message);
            return;
        }

        if (results.length === 0) {
            res.status(404).send("삭제할 공지사항이 없습니다.");
            return;
        }

        const notice = results[0];
        const studyId = notice.study_id; // 공지사항이 속한 스터디의 ID를 가져옴

        if (!studyId) {
            res.status(400).send("해당 공지사항은 스터디에 속해있지 않습니다.");
            return;
        }

        const leaderQuery = 'SELECT * FROM study WHERE study_id = ? AND leader_id = ?';
        const leaderParams = [studyId, member_id];

        db.query(leaderQuery, leaderParams, (leaderError, leaderResults) => {
            if (leaderError) {
                console.error('삭제 권한 확인 중 오류 발생:', leaderError);
                res.status(500).send("서버 오류 발생: " + leaderError.message);
                return;
            }

            if (leaderResults.length === 0) {
                res.status(403).send("삭제 권한이 없습니다.");
                return;
            }

            const deleteQuery = 'DELETE FROM notice WHERE notice_id = ?';
            const deleteParams = [noticeId];

            db.query(deleteQuery, deleteParams, (deleteError, deleteResults) => {
                if (deleteError) {
                    console.error('공지사항 삭제 중 오류 발생:', deleteError);
                    res.status(500).send("서버 오류 발생: " + deleteError.message);
                    return;
                }

                res.status(200).send("공지사항 삭제 완료");
            });
        });
    });
});


//검색
router.get("/search", (req, res) => {
    const { keyword, sort } = req.query;
    let { page, perPage } = req.query;

    if (!page) {
      page = 1;
    }
    if (!perPage) {
      perPage = 10;
    }

    const offset = (page - 1) * perPage;

    let query = `
      SELECT n.notice_id, n.title, n.content, n.created_at, m.nickname AS author_nickname
      FROM notice n
      JOIN member m ON n.member_id = m.member_id
    `;

    const params = [];

    if (keyword) {
      query += `WHERE n.title LIKE ? OR n.content LIKE ?`;
      params.push(`%${keyword}%`, `%${keyword}%`);
    } else {
      query += `WHERE 1=1`;
    }

    if (sort === "latest") {
      query += ` ORDER BY n.created_at DESC `;
    } else {
      query += ` ORDER BY n.created_at ASC `;
    }

    query += `LIMIT ?,?`;
    params.push(offset, parseInt(perPage));

    db.query(query, params, (error, results) => {
      if (error) {
        res.status(500).json({ error: "검색 중 오류가 발생했습니다." });
        console.log(error);
      } else {
        res.json(results);
      }
    });
  });

//제목만
  router.get("/search/title", (req, res) => {
    const { keyword, sort } = req.query;
    let { page, perPage } = req.query;

    if (!page) {
      page = 1;
    }
    if (!perPage) {
      perPage = 10;
    }

    const offset = (page - 1) * perPage;

    let query = `
      SELECT n.notice_id, n.title, n.content, n.created_at, m.nickname AS author_nickname
      FROM notice n
      JOIN member m ON n.member_id = m.member_id
    `;

    const params = [];

    if (keyword) {
      query += `WHERE n.title LIKE ?`; // 여기를 수정
      params.push(`%${keyword}%`);
    } else {
      query += `WHERE 1=1`;
    }

    if (sort === "latest") {
      query += ` ORDER BY n.created_at DESC `;
    } else {
      query += ` ORDER BY n.created_at ASC `;
    }

    query += `LIMIT ?,?`;
    params.push(offset, parseInt(perPage));

    db.query(query, params, (error, results) => {
      if (error) {
        res.status(500).json({ error: "검색 중 오류가 발생했습니다." });
        console.log(error);
      } else {
        res.json(results);
      }
    });
  });


module.exports = router;