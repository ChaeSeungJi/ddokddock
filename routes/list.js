const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const db = require('../util/db');

router.use(bodyParser.urlencoded({ extended: true }));

router.get('/', (req, res) => {
    const { sort } = req.query;
    const page = parseInt(req.query.page) || 1; // 기본값을 1로 설정
    const perPage = parseInt(req.query.perPage) || 10; // 기본값을 10으로 설정
  
    // 페이징 처리
    const offset = (page - 1) * perPage;
  
    let query = `
      SELECT s.study_id, s.title, SUBSTR(s.content, 1, 20) AS content, s.image_url, m.nickname AS leader_nickname, s.created_at
      FROM study s
      JOIN member m ON s.leader_id = m.member_id
    `;
  
    if (sort === 'latest') {
      query += ` ORDER BY s.created_at DESC `;
    } else {
      query += ` ORDER BY s.created_at ASC `;
    }
  
    query += ` LIMIT ?, ? `;
  
    db.query(query, [offset, perPage], (error, results) => {
      if (error) {
        console.error('스터디 목록 조회 중 오류 발생: ', error);
        res.status(500).json({ error: '스터디 목록 조회 중 오류가 발생했습니다.' });
      } else {
        if (results.length === 0) {
          res.status(404).json({ message: '스터디 목록이 비어 있습니다.' });
        } else {
          res.json(results);
        }
      }
    });
  });


  module.exports = router;
  
/*const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const db = require('../util/db');

router.use(bodyParser.urlencoded({ extended: true }));

router.get('/', (req, res) => {
  const query = `
    SELECT s.study_id, s.title, SUBSTR(s.content, 1, 20) AS content, s.image_url, m.nickname AS leader_nickname, s.created_at
    FROM study s
    JOIN member m ON s.leader_id = m.member_id
    ORDER BY s.created_at DESC
  `;
  
  db.query(query, (error, results) => {
    if (error) {
      console.error('스터디 목록 조회 중 오류 발생: ', error);
      res.status(500).json({ error: '스터디 목록 조회 중 오류가 발생했습니다.' });
    } else {
      if (results.length === 0) {
        res.status(404).json({ message: '스터디 목록이 비어 있습니다.' });
      } else {
        res.json(results);
      }
    }
  });
});

module.exports = router;*/