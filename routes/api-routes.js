var express = require('express');
var router = express.Router();
var interf = require('../modules/interface');

router.get('/sync', function (req, res) {
    interf.getAllFromApi(()=>{
        res.send(srvPiConfig);
    })
});

router.get('/get_element_list', function (req, res) {
    if(req.query.op){
        console.log("Output Path: " + req.query.op);
        console.log("Query ID: " + req.query.qid);
        console.log(interf.getAllFromApi())
    }else{
        res.send("Invalid Request");
    }
});
module.exports = router;