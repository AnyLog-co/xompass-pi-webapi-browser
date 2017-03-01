/**
 * Created by Andres on 8/4/2016.
 */

var interface = require('./interface');
var WebSocket = require('ws');
var b64login = "";
var opts = {};

exports.start = function(){
    b64login = new Buffer(srvConfig.username + ":" + srvConfig.password).toString('base64');
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

    streams[attributeId].on('open', function() {
        console.log("WS Opened: " + this.Name + " Id: " + this.Id);
    });
    streams[attributeId].on('message', function(message) {
        console.log('Received on ' + this.Name + " " + this.Id + " :\n" + message);
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