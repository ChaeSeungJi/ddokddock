const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const db = require('../util/db');

router.use(bodyParser.urlencoded({ extended: true }));

router.get('/', (req, res) => {
  const { keyword, sort } = req.query;
  let { page, perPage } = req.query;

  if (!page || !perPage) {
    page = 1;
    perPage = 10;
  }

  const offset = (page - 1) * perPage;

  let query = ` 
    SELECT s.study_id, s.title, s.content, s.image_url, m.nickname AS leader_nickname, s.created_at
    FROM study s
    JOIN member m ON s.leader_id = m.member_id
  `;

  const params = [];

  if (keyword) {
    query += ` WHERE s.title LIKE ? OR s.content LIKE ? `;
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  if (sort === 'latest') {
    query += ` ORDER BY s.created_at DESC `;
  } else {
    query += ` ORDER BY s.created_at ASC `;
  }

  query += ` LIMIT ?, ? `;
  params.push(offset, parseInt(perPage));

  db.query(query, params, (error, results) => {
    if (error) {
      console.error('검색 중 오류 발생:', error);
      res.status(500).json({ error: '검색 중 오류가 발생했습니다.' });
    } else {
      res.json(results);
    }
  });
});

module.exports = router;