const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../../util/db');

router.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/profile/');
    },
    filename: function (req, file, cb) {
        cb(null, req.session.member_id + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.post('/upload', upload.single('profileImage'), (req, res) => {
    const member_id = req.session.member_id;
    console.log("member_id:", member_id);
    const profileImagePath = `/profile_image/${req.file.filename}`;

    const query = `UPDATE member SET profile_image = ? WHERE member_id = ?`;
    const params = [profileImagePath, member_id];

    db.query(query, params, (error, results) => {
        if (error) {
            console.error('프로필 사진 업데이트 중 오류 발생:', error);
            res.status(500).json({ error: '프로필 사진 업데이트 중 오류가 발생했습니다.' });
        } else {
            res.json({ message: '프로필 사진이 성공적으로 업데이트되었습니다.', imagePath: profileImagePath });
        }
    });
});

module.exports = router;
