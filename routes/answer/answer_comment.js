const express = require("express");
const router = express.Router();
const db = require("../../util/db");


router.post('/',(req,res)=>{
    const member_id = req.body.member_id;
    const {answerId, parentCommentId, content} = req.body;

    if(!member_id){
        res.status(400).send("로그인 후 사용해주세요");
        return;
    }

    var sql = `insert into answer_comment 
    (answer_id, member_id, parent_comment_id, content, created_at)
    values (?,?, ?,?,now())`;

    var params = [answerId,member_id,parentCommentId,content];

    db.query(sql, params, (error,results)=>{
        if(error){
            res.status(500).send("서버오류 발생" + error.message);
            return;
        }
        if(results.affectedRows>0){
            res.status(200).send("댓글 작성 성공");
        }
        else{
            res.send("댓글 작성 실패");
        }
    });

})


router.post('/update',(req,res)=>{
    const member_id = req.body.member_id;
    const {commentId, content} = req.body;

    var sql = "update answer_comment set content = ? where answer_comment_id = ? and member_id = ?";
    var params = [content, commentId, member_id];

    db.query(sql, params, (error,results)=>{
        if(error){
            res.status(500).send("서버 오류 발생" + error.message);
            return;
        }
        if(results.affectedRows>0){
            res.status(200).send("댓글 수정 완료");
        }
        else{
            res.status(403).send("수정 권한이 없거나 댓글이 존재하지 않습니다.");
        }
    })
})


router.post('/delete', (req,res)=>{
    const member_id = req.body.member_id;
    const commentId = req.body.commentId;

    var sql = "delete from answer_comment where answer_comment_id = ? and member_id =?";
    var params = [commentId,member_id];

    db.query(sql, params, (error,results)=>{
        if(error){
            res.status(500).send("서버 오류 발생 : " + error.message);
            return;
        }
        if(results.affectedRows > 0){
            res.status(200).send("댓글 삭제 완료");
        }
    })
})

module.exports = router;
