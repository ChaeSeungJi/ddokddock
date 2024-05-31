//태그(백엔드)를 사용하여 검색하고 목록 출력
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const db = require('../util/db');

router.use(express.urlencoded({ extended: true }));

// 태그 검색 요청 처리
router.get('/:searchTag', (req, res) => {
  console.log('GET /tag route called');
  const searchTag = req.params.searchTag;
  const { sort, page, perPage } = req.query;
  console.log(`검색된 태그: ${searchTag}`);

  // 페이징 처리
  const offset = (page - 1) * perPage;

  let query = `
    SELECT s.study_id, s.title, s.content, s.image_url, m.nickname AS leader_nickname
    FROM study s
    JOIN member m ON s.leader_id = m.member_id
    JOIN study_tag st ON s.study_id = st.study_id
    JOIN tag t ON st.tag_id = t.tag_id
    WHERE t.tag_name = ?
  `;

  if (sort === 'latest') {
    query += ` ORDER BY s.created_at DESC `;
  } else {
    query += ` ORDER BY s.created_at ASC `;
  }

  query += ` LIMIT ?, ? `;

  db.query(query, [searchTag, offset, parseInt(perPage)], (error, results) => {
    if (error) {
      console.error('태그 검색 중 오류 발생:', error);
      res.status(500).json({ error: '태그 검색 중 오류가 발생했습니다.' });
    } else {
      console.log('검색 결과:', results);
      res.json(results);
    }
  });
});

module.exports = router;

