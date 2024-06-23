const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const db = require('../../util/db');

router.use(express.urlencoded({ extended: true }));


// 개설한 스터디 보기
router.post('/created', (req, res) => {
  const member_id = req.body.member_id;
    // const member_id = req.session.member_id;

    // if (!member_id) {
    //   return res.status(401).send("로그인이 필요합니다.");
    // }
    const { status } = req.query;
  
    let query = `
      SELECT s.study_id, s.title, s.image_url, s.status
      FROM study s
      WHERE s.leader_id = ${member_id}
    `;
  
    const params = [member_id];
  
    if (status === 'ing' || status === 'end') {
      query += ` AND s.status = ?`;
      params.push(status);
    }
  
    db.query(query, (error, results) => {
      if (error) {
        console.error('개설한 스터디 조회 중 오류 발생:', error);
        res.status(500).json({ error: '개설한 스터디 조회 중 오류가 발생했습니다.' });
      } else {
        res.json(results);
      }
    });
  });
  
  router.post('/joined', (req, res) => {
    // const member_id = req.session.member_id;

    // if (!member_id) {
    //     return res.status(401).send("로그인이 필요합니다.");
    // }

    const { status } = req.query;
    const member_id = req.body.member_id;

    let query = `
        SELECT s.study_id, s.title, s.image_url, s.status
        FROM study s
        JOIN study_member sm ON s.study_id = sm.study_id
        WHERE sm.member_id = ? AND sm.request_status='APPROVED'
    `;
    const params = [member_id];

    if (status === 'ing' || status === 'end') {
        query += ' AND s.status = ?';
        params.push(status);
    }

    db.query(query, params, (error, studies) => {
        if (error) {
            console.error('참여한 스터디 조회 중 오류 발생:', error);
            return res.status(500).json({ error: '참여한 스터디 조회 중 오류가 발생했습니다.' });
        }

        if (studies.length === 0) {
            return res.json([]);
        }

        const studyIds = studies.map(study => study.study_id);
        const tagQuery = `
            SELECT st.study_id, t.tag_id, t.tag_name
            FROM study_tag st
            JOIN tag t ON t.tag_id = st.tag_id
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
    });
});


  module.exports = router;