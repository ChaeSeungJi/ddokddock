const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const db = require('../../util/db');

router.use(express.urlencoded({ extended: true }));

// 댓글 생성
router.post('/', (req, res) => {
    const member_id = req.body.member_id;
    const { studyId, parentCommentId, content } = req.body;

    if (!member_id) {
        res.status(400).send("로그인 후 사용해주세요");
        return;
    }

    const query = `
        INSERT INTO study_comment (study_id, member_id, parent_comment_id, content, created_at) VALUES (?, ?, ?, ?, NOW())
    `;

    db.query(query, [studyId, member_id, parentCommentId, content], (error, results) => {
        if (error) {
            res.status(500).send("서버 오류 발생: " + error.message);
            return;
        }
        if (results.affectedRows > 0) {
            res.status(200).send("댓글 작성 성공");
        } else {
            res.send("댓글 작성 실패");
        }
    });
});

// 댓글 수정
router.post('/update', (req, res) => {
    const member_id = req.body.member_id;
    const { commentId, content } = req.body;

    const query = 'UPDATE study_comment SET content = ? WHERE comment_id = ? AND member_id = ?';
    const params = [content, commentId, member_id];

    db.query(query, params, (error, results) => {
        if (error) {
            console.error('댓글 수정 중 오류 발생:', error);
            res.status(500).send("서버 오류 발생: " + error.message);
            return;
        }

        if (results.affectedRows > 0) {
            res.status(200).send("댓글 수정 완료");
        } else {
            res.status(403).send("수정 권한이 없거나 댓글이 존재하지 않습니다.");
        }
    });
});

// 댓글 목록 조회
router.post('/list', (req, res) => {
    const { studyId, sort, page, perPage } = req.query;

    if (!studyId) {
        return res.status(400).send("스터디 ID가 필요합니다.");
    }

    const pageNumber = parseInt(page) || 1;
    const limit = parseInt(perPage) || 10;

    const offset = (pageNumber - 1) * limit;

    let query = `
        SELECT c.comment_id, c.study_id, c.member_id, c.parent_comment_id, c.content, c.created_at, m.nickname
        FROM study_comment c
        JOIN member m ON c.member_id = m.member_id
        WHERE c.study_id = ?
    `;

    if (sort === 'latest') {
        query += ' ORDER BY c.parent_comment_id, c.created_at DESC';
    } else {
        query += ' ORDER BY c.parent_comment_id, c.created_at ASC';
    }

    query += ' LIMIT ?, ?';

    const params = [studyId, offset, limit];

    db.query(query, params, (error, results) => {
        if (error) {
            res.status(500).send("서버 오류 발생: " + error.message);
            return;
        }
        res.status(200).json(results);
    });
});

// 댓글 삭제
router.post('/delete', (req, res) => {
    const member_id = req.body.member_id;
    const commentId = req.body.commentId;
    const studyId = req.body.studyId;

    const query = 'DELETE FROM study_comment WHERE comment_id = ? AND study_id = ? AND member_id = ?';
    const params = [commentId, studyId, member_id];

    db.query(query, params, (error, results) => {
        if (error) {
            res.status(500).send("서버 오류 발생: " + error.message);
            return;
        }
        if (results.affectedRows > 0) {
            res.status(200).send("댓글 삭제 완료");
        } else {
            res.status(403).send("삭제 권한이 없습니다.");
        }
    });
});

module.exports = router;