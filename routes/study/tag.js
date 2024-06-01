const express = require("express");
const router = express.Router();
const db = require("../../util/db");

router.use(express.urlencoded({ extended: true }));

// 태그 검색 요청 처리
router.get("/", (req, res) => {
  console.log("GET /tag route called");
  // const searchTag = req.query.tag;
  const searchTag = "백엔드";
  console.log(`검색된 태그: ${searchTag}`);
  const decodedSearchTag = decodeURIComponent(searchTag);

  const query = `
    SELECT s.study_id, s.title, s.content, m.nickname AS leader_nickname
    FROM study s
    JOIN member m ON s.leader_id = m.member_id
    JOIN study_tag st ON s.study_id = st.study_id
    JOIN tag t ON st.tag_id = t.tag_id
    WHERE t.tag_id = (SELECT tag_id FROM tag WHERE tag_name = ?)
  `;

  db.query(query, [decodedSearchTag], (error, results) => {
    if (error) {
      console.error("태그 검색 중 오류 발생:", error);
      res.status(500).json({ error: "태그 검색 중 오류가 발생했습니다." });
    } else {
      console.log("검색 결과:", results);
      res.json(results);
    }
  });
});

module.exports = router;
