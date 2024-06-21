const express = require("express");
const router = express.Router();
const db = require("../../util/db");

// 채팅 페이지 렌더링 (예제)
router.get("/", (req, res) => {
  res.send("test");
});

// 채팅 메시지 저장 및 전송
router.post("/message", (req, res) => {
  const { message } = req.body;
  const member_id = req.session.member_id;

  if (!member_id) {
    return res.status(401).send("Unauthorized");
  }

  // 데이터베이스에 메시지 저장
  const query =
    "INSERT INTO chat (member_id, message, created_at) VALUES (?, ?, now())";

  data = [member_id, message];
  db.query(query, data, (err, result) => {
    if (err) {
      return res.status(500).send("Database error");
    }

    // 메시지 저장 후 emit
    const getUserQuery = "SELECT nickname FROM member WHERE member_id = ?";
    db.query(getUserQuery, [member_id], (err, results) => {
      if (err) {
        return res.status(500).send("Database error");
      }

      const nickname = results[0].nickname;
      req.io.emit("message", { nickname, message });
      res.send("Message sent");
    });
  });
});

module.exports = router;
