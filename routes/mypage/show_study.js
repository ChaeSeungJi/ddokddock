const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const db = require('../../util/db');

router.use(express.urlencoded({ extended: true }));


// 개설한 스터디 보기
router.get('/created', (req, res) => {
    const member_id = req.session.member_id;
    const { status } = req.query;
  
    let query = `
      SELECT s.study_id, s.title, s.image_url, s.status
      FROM study s
      WHERE s.leader_id = ?
    `;
  
    const params = [member_id];
    console.log(req.session.member_id);
  
    if (status === 'ing' || status === 'end') {
      query += ` AND s.status = ?`;
      params.push(status);
    }
  
    db.query(query, params, (error, results) => {
      if (error) {
        console.error('개설한 스터디 조회 중 오류 발생:', error);
        res.status(500).json({ error: '개설한 스터디 조회 중 오류가 발생했습니다.' });
      } else {
        res.json(results);
      }
    });
  });
  
  // 참여한 스터디 보기
  router.get('/joined', (req, res) => {
    const member_id = req.session.member_id;
    const { status } = req.query;
  
    let query = `
      SELECT s.study_id, s.title, s.image_url, s.status
      FROM study s
      JOIN study_member sm ON s.study_id = sm.study_id
      WHERE sm.member_id = ? AND sm.is_member = 1
    `;
  
    const params = [member_id];
    console.log(req.session.member_id);
  
    if (status === 'ing' || status === 'end') {
      query += ` AND s.status = ?`;
      params.push(status);
    }
  
    db.query(query, params, (error, results) => {
      if (error) {
        console.error('참여한 스터디 조회 중 오류 발생:', error);
        res.status(500).json({ error: '참여한 스터디 조회 중 오류가 발생했습니다.' });
      } else {
        res.json(results);
      }
    });
  });


  module.exports = router;