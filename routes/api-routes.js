var express = require('express');
var router = express.Router();
var interf = require('../modules/interface2');

router.get('/af_sync', function (req, res) {
    if(req.query.dbid){
        interf.getAllFromAF(req.query.dbid, ()=>{
            res.send(srvPiConfig);
        })
    }else{
        res.send("Invalid Request");
    }
});

router.get('/af_list', function (req, res) {
    interf.getAssetServers(function(asWebId, totalAssetServers){
        res.send(srvPiConfig.assetServers);
    });
});

router.get('/af_databases', function (req, res) {
    if(req.query.afid){    
        console.log(req.query.afid)
        let asWebId = srvPiConfig.idToWebId[req.query.afid];
        console.log(asWebId)
        if(asWebId)
            interf.getDataBases2(asWebId, function(dbWebId, totalDBs){
                res.send(srvPiConfig.assetDBs)
            });
    }else{
        res.send("Invalid Request");
    }
});


router.get('/get_element_list', function (req, res) {
    res.send(srvPiConfig.elements);
    let date = new Date().getTime();
    //freader.saveFile2(filename, JSON.stringify(srvPiConfig.elements, null, '\t'));
    console.log("Done GET /get_element_list, Output: " + filename)
});

router.get('/get_sensors_list', function (req, res) {
    interf.getAllAttributes(function(){   
        let date = new Date().getTime();
        //freader.saveFile2(filename, JSON.stringify(srvPiConfig.attributes, null, '\t'));
        console.log("Done GET /get_sensors_list, Output: " + filename)
        res.send(srvPiConfig.attributes);
    });
});

router.get('/get_element_info', function (req, res) {
    if(req.query.eid){
        let element = srvPiConfig.elements[req.query.eid]
        let date = new Date().getTime();
        //freader.saveFile2(filename, JSON.stringify(element, null, '\t'));
        console.log("Done GET /get_element_info, Output: " + filename)
        res.send(element);
    }else{
        res.send("Invalid Request");
    }
});

router.get('/get_sensor_info', function (req, res) {
    if(req.query.sid){
        let attribute = srvPiConfig.attributes[req.query.sid]
        let date = new Date().getTime();
        //freader.saveFile2(filename, JSON.stringify(attribute, null, '\t'));
        console.log("Done GET /get_sensor_info, Output: " + filename)
        res.send(attribute);
    }else{
        res.send("Invalid Request");
    }
});

router.get('/get_sensors_in_element', function (req, res) {
    if(req.query.eid){
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

            //freader.saveFile2(filename, JSON.stringify(allAtts, null, '\t'));
            res.send(allAtts);
        });
    }else{
        res.send("Invalid Request");
    }
});


router.get('/get_sensor_data', function (req, res) {
    if(req.query.sid && req.query.time){
        let swebId = srvPiConfig.idToWebId[req.query.sid];
        interf.getSensorDataSingle(swebId, req.query.time, function(data){
            if(data){
                res.send(data);
            }
        })
    }else{
        res.send("Invalid Request");
    }
});

router.get('/get_sensor_data_summary', function (req, res) {
    if(req.query.sid && req.query.stime && req.query.etime && req.query.summtype && req.query.grouptime){
        let swebId = srvPiConfig.idToWebId[req.query.sid];
        interf.getSensorDataSummary(swebId, req.query.stime,req.query.etime,req.query.grouptime, req.query.summtype, function(data){
            if(data){
                res.send(data);
            }
        })
    }else{
        res.send("Invalid Request");
    }
});

router.get('/get_sensor_data_range', function (req, res) {
    if(req.query.sid && req.query.stime && req.query.etime){
        let swebId = srvPiConfig.idToWebId[req.query.sid];
        interf.getSensorData(swebId, req.query.stime,req.query.etime, function(data){
            if(data){
                res.send(data);
            }
        })
    }else{
        res.send("Invalid Request");
    }
});

router.get('/search', function (req, res) {
    if(req.query.q){
        interf.getSearchQuery(req.query.q, req.query.scope, req.query.fields, req.query.count,req.query.start, function(data){
            if(data){
                res.send(data);
            }
        })
    }else{
        res.send("Invalid Request");
    }
});

module.exports = router;