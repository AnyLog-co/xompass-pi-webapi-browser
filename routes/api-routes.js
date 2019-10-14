var express = require('express');
var router = express.Router();
var interf = require('../modules/interface2');

router.get('/af_sync', function (req, res) {
    if(req.query.db || req.query.dbid){
        interf.getAllFromAF(req.query.db || req.query.dbid, ()=>{
            res.send("Sync Done!");
        })
    }else{
        res.send("Invalid Request");
    }
});

router.get('/get_element_list', function (req, res) {
    if(req.query.op && req.query.qid){
        res.send(srvPiConfig.elements);
        let date = new Date().getTime();
        let filename = req.query.op+'elist.'+date+'.'+req.query.qid+'.json';
        freader.saveFile2(filename, JSON.stringify(srvPiConfig.elements, null, '\t'));
        console.log("Done GET /get_element_list, Output: " + filename)
    }else{
        res.send("Invalid Request");
    }
});

router.get('/get_sensors_list', function (req, res) {
    if(req.query.op && req.query.qid){
        interf.getAllAttributes(function(){   
            let date = new Date().getTime();
            let filename = req.query.op+'slist.'+date+'.'+req.query.qid+'.json';
            freader.saveFile2(filename, JSON.stringify(srvPiConfig.attributes, null, '\t'));
            console.log("Done GET /get_sensors_list, Output: " + filename)
            res.send(srvPiConfig.attributes);
        });
    }else{
        res.send("Invalid Request");
    }
});

router.get('/get_element_info', function (req, res) {
    if(req.query.op && req.query.qid && req.query.eid){
        let element = srvPiConfig.elements[req.query.eid]
        let date = new Date().getTime();
        let filename = req.query.op+'einfo.'+element.Name+'.'+date+'.'+req.query.qid+'.json';
        freader.saveFile2(filename, JSON.stringify(element, null, '\t'));
        console.log("Done GET /get_element_info, Output: " + filename)
        res.send(element);
    }else{
        res.send("Invalid Request");
    }
});

router.get('/get_sensor_info', function (req, res) {
    if(req.query.op && req.query.qid && req.query.sid){
        let attribute = srvPiConfig.attributes[req.query.sid]
        let date = new Date().getTime();
        let filename = req.query.op+'sinfo.'+attribute.Name+'.'+date+'.'+req.query.qid+'.json';
        freader.saveFile2(filename, JSON.stringify(attribute, null, '\t'));
        console.log("Done GET /get_sensor_info, Output: " + filename)
        res.send(attribute);
    }else{
        res.send("Invalid Request");
    }
});

router.get('/get_sensors_in_element', function (req, res) {
    if(req.query.op && req.query.qid && req.query.eid){
        let elementWebId = srvPiConfig.idToWebId[req.query.eid];
        console.log(elementWebId)
        interf.getAttributes(elementWebId, function(){
            let date = new Date().getTime();
            let elementSensors = srvPiConfig.elements[req.query.eid].Attributes;
            //console.log(elementSensors)
            let allAtts={};
            for(let att in elementSensors){
                let aid = elementSensors[att]
                allAtts[aid] = srvPiConfig.attributes[aid];
            }

            let filename = req.query.op+'esensors.'+srvPiConfig.elements[req.query.eid].Name+'.'+date+'.'+req.query.qid+'.json';

            freader.saveFile2(filename, JSON.stringify(allAtts, null, '\t'));
            res.send(allAtts);
            console.log("Done GET /get_sensors_in_element, Output: " + filename)
        });
    }else{
        res.send("Invalid Request");
    }
});

module.exports = router;