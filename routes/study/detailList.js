const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const db = require('../../util/db');

router.use(express.urlencoded({ extended: true }));

router.post('/', (req, res) => {
  const studyId = req.query.studyId;
  
  if (!studyId) {
    res.status(400).json({ error: '스터디 ID가 제공되지 않았습니다.' });
    return;
  }
  
  const query = `
    SELECT s.study_id, s.title, s.content, s.image_url, m.nickname AS leader_nickname, s.created_at
    FROM study s
    JOIN member m ON s.leader_id = m.member_id
    WHERE s.study_id = ?
  `;
  
  db.query(query, [studyId], (error, results) => {
    if (error) {
      console.error('스터디 상세 페이지 조회 중 오류 발생: ', error);
      res.status(500).json({ error: '스터디 상세 페이지 조회 중 오류가 발생했습니다.' });
    } else {
      if (results.length === 0) {
        res.status(404).json({ message: '해당 스터디를 찾을 수 없습니다.' });
      } else {
        res.json(results[0]);
      }
    }
  });
});

module.exports = router;