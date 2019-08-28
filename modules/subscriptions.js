/**
 * Created by Andres on 8/4/2016.
 */

var interface = require('./interface');
var WebSocket = require('ws');
var fs = require('fs');
var b64login = "";
var opts = {};
var outputdir = "output_data/"

exports.start = function(){
    b64login = Buffer.from(srvConfig.username + ":" + srvConfig.password).toString('base64');
    opts = {
        rejectUnauthorized: false,
        headers: {
            Authorization: 'Basic ' + b64login
        }
    };
    getStreams();
};

var streams = {};

getStreams = function (){
    if(srvPiConfig && srvPiConfig.attributes)
    Object.keys(srvPiConfig.attributes).forEach(function(attributeId){
        if(srvPiConfig.attributes[attributeId].Subscribed == true){
            streams[attributeId] = new WebSocket("wss://" + srvConfig.webapi_host + "/piwebapi/streams/" + srvPiConfig.attributes[attributeId].WebId + "/channel?includeInitialValues=" + (srvConfig.requestLastPoint || "false"), opts);
            streams[attributeId].Name = srvPiConfig.attributes[attributeId].Name;
            streams[attributeId].Id = srvPiConfig.attributes[attributeId].Id;

            streams[attributeId].on('open', function() {
                console.log("WS Opened: " + this.Name + " Id: " + this.Id);
            });
            streams[attributeId].on('message', function(message) {
                //console.log('Received on ' + this.Name + " " + this.Id + " :\n" + message);
                // If Value is object is because point has no data, just created
                try{
                    var jsonMsg = JSON.parse(message);
                    jsonMsg.Items.forEach(function(msg){
                        let attributeId = srvPiConfig.attPathToId[msg.Path];
                        if(srvPiConfig.attributes[attributeId] && srvPiConfig.attributes[attributeId].Subscribed){
                            msg.Items.forEach(function(valueObj){
                                if(valueObj.Good == true){
                                    wsockets.sendData(attributeId, valueObj.Value);
                                }
                            });
                        }
                    });

                }catch(e){
                    console.log(e);
                }
            });
        }
    });
};

addStream = function(attributeId){

    if(streams[attributeId])
        removeStream(attributeId);

    srvPiConfig.attributes[attributeId].Subscribed = true;

    streams[attributeId] = new WebSocket("wss://" + srvConfig.webapi_host + "/piwebapi/streams/" + srvPiConfig.attributes[attributeId].WebId + "/channel?includeInitialValues=" + (srvConfig.requestLastPoint || "false"), opts);
    streams[attributeId].Name = srvPiConfig.attributes[attributeId].Name;
    streams[attributeId].Id = srvPiConfig.attributes[attributeId].Id;
    
        //Display backend information
        //console.log(srvPiConfig.elements);

    streams[attributeId].on('open', function() {
        console.log("WS Opened: " + this.Name + " Id: " + this.Id);
    });
    streams[attributeId].on('message', function(message) {
        console.log('Received on ' + this.Name + " " + this.Id + " :\n" + message);
        // If Value is object is because point has no data, just created
        try{
            //console.log(jsonMsg);
            var jsonMsg = JSON.parse(message);
            console.log(jsonMsg);
            jsonMsg.Items.forEach(function(msg){
                let attributeId = srvPiConfig.attPathToId[msg.Path];
                if(srvPiConfig.attributes[attributeId] && srvPiConfig.attributes[attributeId].Subscribed){
                    msg.Items.forEach(function(valueObj){
                        if(valueObj.Good == true){
                            let newValueObj = {
                                //********
                                // Added by Andres to get Extra Info
                                //********
                                //Array with Categories of the Sensor
                                CategoryNames: srvPiConfig.attributes[attributeId]["CategoryNames"], 
                                ParentElement: srvPiConfig.attributes[attributeId]["ParentElement"], 
                                 //Type of the data source, e.g: PI Point, Formula, Query, etc..
                                DataReferencePlugIn: srvPiConfig.attributes[attributeId]["DataReferencePlugIn"],
                                //Config string of the datatype, will change depending on the type of the data reference
                                ConfigString: srvPiConfig.attributes[attributeId]["ConfigString"], 
                                // Template name of the Element (device), which determines the set of attributes (sensors) it has. e.g: 
                                ParentElementTemplate: srvPiConfig.elements[srvPiConfig.attributes[attributeId].ParentElement]["TemplateName"], 
                                
                                WebId: msg.WebId,
                                Name: msg.Name,
                                Path: msg.Path,
                                Value: valueObj.Value,
                                Timestamp: valueObj.Timestamp, 
                              };
                              if (valueObj.Good == true) {
                                console.log(JSON.stringify(newValueObj));
                                saveDataFile(newValueObj);
                              }

                            wsockets.sendData(attributeId, valueObj.Value);
                        }
                    });
                }
            });

        }catch(e){
            console.log(e);
        }
    });
}

// Added by andres
saveDataFile = function (newValueObj){
    var date = new Date(newValueObj.Timestamp);
    let outputfilename = `${newValueObj.WebId}.${date.getTime()}.${newValueObj.Name}_sensor.json`
                              
    fs.writeFile(outputdir + outputfilename, JSON.stringify(newValueObj, null, '\t'), { flag: 'w' }, function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
     
        console.log("JSON output file has been saved.");
    });
  };

removeStream = function(attributeId){
    if(streams[attributeId]){
        srvPiConfig.attributes[attributeId].Subscribed = false;
        streams[attributeId].close();
        delete streams[attributeId];
    }
}

exports.getStreams = getStreams;
exports.addStream = addStream;
exports.removeStream = removeStream;
exports.streams = streams;