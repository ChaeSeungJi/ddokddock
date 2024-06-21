const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const db = require('../../util/db');

router.use(express.urlencoded({ extended: true }));

router.post('/', (req, res) => {
  const { studyId, sort, page, perPage } = req.query;

  if (!page || !perPage) {
    page = 1;
    perPage = 10;
  }

  const offset = (page - 1) * perPage;

  let query = `
    SELECT c.curriculum_id, c.curriculum_no, c.content
    FROM curriculum c
    WHERE c.study_id = ?
  `;

  if (sort === 'latest') {
    query += ` ORDER BY c.curriculum_no DESC `;
  } else {
    query += ` ORDER BY c.curriculum_no ASC `;
  }

  query += ` LIMIT ?, ? `;

  db.query(query, [studyId, offset, parseInt(perPage)], (error, results) => {
    if (error) {
      console.error('커리큘럼 조회 중 오류 발생:', error);
      res.status(500).json({ error: '커리큘럼 조회 중 오류가 발생했습니다.' });
    } else {
      res.json(results);
    }
  });
});

module.exports = router;