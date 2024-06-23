const express = require("express");
const router = express.Router();
const db = require("../../util/db");

router.get("/", (req, res) => {
  const { sort } = req.query;
  let { page, perPage } = req.query;

  if (!page) {
    page = 1;
  }
  if (!perPage) {
    perPage = 10;
  }

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

  db.query(query, [offset, parseInt(perPage)], (error, studies) => {
    if (error) {
      console.error('스터디 목록 조회 중 오류 발생: ', error);
      res.status(500).json({ error: '스터디 목록 조회 중 오류가 발생했습니다.' });
    } else {
      if (studies.length === 0) {
        res.status(404).json({ message: '스터디 목록이 비어 있습니다.' });
      } else {
        const studyIds = studies.map(study => study.study_id);
        const tagQuery = `
          SELECT st.study_id, t.tag_id, t.tag_name
          FROM study_tag st
          JOIN tag t ON st.tag_id = t.tag_id
          WHERE st.study_id IN (?)
        `;
        db.query(tagQuery, [studyIds], (tagError, tags) => {
          if (tagError) {
            console.error('태그 조회 중 오류 발생:', tagError);
            return res.status(500).json({ error: '태그 조회 중 오류가 발생했습니다.' });
          }
          const tagMap = tags.reduce((acc, tag) => {
            if (!acc[tag.study_id]) {
              acc[tag.study_id] = [];
            }
            acc[tag.study_id].push({ tag_id: tag.tag_id, tag_name: tag.tag_name });
            return acc;
          }, {});
          const results = studies.map(study => ({
            ...study,
            tags: tagMap[study.study_id] || []
          }));
          res.json(results);
        });
      }
    }
  });
});

router.post("/search", (req, res) => {
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
    SELECT s.study_id, s.title, s.content, s.image_url, m.nickname AS leader_nickname, s.created_at
    FROM study s
    JOIN member m ON s.leader_id = m.member_id
  `;

  const params = [];

  if (keyword) {
    query += ` WHERE s.title LIKE ? OR s.content LIKE ? `;
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  if (sort === "latest") {
    query += ` ORDER BY s.created_at DESC `;
  } else {
    query += ` ORDER BY s.created_at ASC `;
  }

  query += ` LIMIT ?, ? `;
  params.push(offset, parseInt(perPage));

  db.query(query, params, (error, studies) => {
    if (error) {
      console.error("검색 중 오류 발생:", error);
      res.status(500).json({ error: "검색 중 오류가 발생했습니다." });
    } else {
      const studyIds = studies.map(study => study.study_id);
      const tagQuery = `
        SELECT st.study_id, t.tag_id, t.tag_name
        FROM study_tag st
        JOIN tag t ON st.tag_id = t.tag_id
        WHERE st.study_id IN (?)
      `;
      db.query(tagQuery, [studyIds], (tagError, tags) => {
        if (tagError) {
          console.error('태그 조회 중 오류 발생:', tagError);
          return res.status(500).json({ error: '태그 조회 중 오류가 발생했습니다.' });
        }
        const tagMap = tags.reduce((acc, tag) => {
          if (!acc[tag.study_id]) {
            acc[tag.study_id] = [];
          }
          acc[tag.study_id].push({ tag_id: tag.tag_id, tag_name: tag.tag_name });
          return acc;
        }, {});
        const results = studies.map(study => ({
          ...study,
          tags: tagMap[study.study_id] || []
        }));
        res.json(results);
      });
    }
  });
});

module.exports = router;
