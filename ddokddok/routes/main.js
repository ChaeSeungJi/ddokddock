var express = require('express');
var router = express.Router();
// 작성자 : 정주영
/* GET main home page. */
router.get('/', function(req, res, next) {
  res.render('main', { title: '똑똑' });
});
router.get('/login', function(req, res, next) {
    res.render('login', { title: '똑똑' });
  });
module.exports = router;
