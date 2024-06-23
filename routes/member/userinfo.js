var express = require("express");
var router = express.Router();
var db = require("../../util/db");


router.get("/", (req,res)=>{
    const member_id = req.session.member_id;

    console.log(member_id);

    if(!member_id){
        return res.status(401).send("로그인 후 사용해주세요");
    }

    const sql = "select * from member where member_id = ? ";
    
    db.query(sql, member_id, (error,result)=>{
        if(error){
            return res.status(500).send("서버에러");
        }

        res.status(200).json(result[0])
    })

})


module.exports = router;
