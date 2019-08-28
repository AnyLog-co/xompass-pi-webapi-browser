/**
 * Created by Andres on 9/20/2016.
 */
var sockets = [];
var interface = require(appRoot + '/modules/interface');

function updatePiConfig(){
    interface.genElementTree(function(){
        send({MSGTYPE:"updatePiConfig",DATA:srvPiConfig});
    });
}


function sendData(attid, value){
    send({MSGTYPE: "data", ATTID: attid, VALUE: value});
}

// Simplify Logging to Website View
function log(msg){
    send({MSGTYPE:"log",DATA:msg+"\r\n"});
    console.log(msg);
}

// Senda Messages to all sockets
function send(data){
    try{
        data = JSON.stringify(data);
    }catch(e){
        console.log(e);
    }

    sockets.forEach(function(ws, key){
        try{
            if(ws.writable && ws.writable == true)
                ws.send(data);
        }catch(e){
            ws.writable = false;
        }
    });
};

function addWS(ws){
    sockets.push(ws);
};


exports.addWS = addWS;
exports.send = send;
exports.log = log;
exports.updatePiConfig = updatePiConfig;
exports.sendData = sendData;