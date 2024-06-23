const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const db = require('../../util/db');

router.use(express.urlencoded({ extended: true }));

router.post('/', (req, res) => {
  const { keyword, sort, page, perPage } = req.query;

  if (!page || !perPage) {
    page = 1;
    perPage = 10;
  }

  const offset = (page - 1) * perPage;

  let query = `
    SELECT s.study_id, s.title, s.content, s.image_url, m.nickname AS leader_nickname, s.created_at
    FROM study s
    JOIN member m ON s.leader_id = m.member_id
    JOIN study_tag st ON s.study_id = st.study_id
    JOIN tag t ON st.tag_id = t.tag_id
  `;

  const params = [];

  if (keyword) {
    query += ` WHERE t.tag_name = ? `;
    params.push(keyword);
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
      console.error('태그 검색 중 오류 발생:', error);
      res.status(500).json({ error: '태그 검색 중 오류가 발생했습니다.' });
    } else {
      console.log('검색 결과:', results);
      res.json(results);
    }
  });
});

router.get("/", (req,res)=>{
  const sql = "select * from tag";

  db.query(sql, (error,results) =>{
    if(error){
      res.status(500).send("데이터베이스 오류 발생");
    }
    else{
      res.json(results);
    }
  })
})

module.exports = router;
