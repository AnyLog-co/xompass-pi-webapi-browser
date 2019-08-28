/**
 * Created by Andres on 8/8/2016.
 */
var express = require('express');
var interface = require(appRoot + '/modules/interface');
var subscriptions = require(appRoot + '/modules/subscriptions');
var router = express.Router();

router.ws('/pielements', function(ws, req) {
    ws.send("WS Connected");
    ws.writable = true;

    ws.on('message', function(msg) {
        console.log("Received from WS", msg);
        try{
            var data = JSON.parse(msg);
            if(data.MSGTYPE == "get"){
                switch(data.TYPE){
                    case "databases":
                        srvPiConfig = interface.initialPiconfig;
                        interface.getAssetServers(function(asWebId, pendingAServers){
                            //console.log("Pending AS: " + pendingAServers);
                            interface.getDataBases(asWebId, function(dbWebId, pendingDBs){
                                wsockets.updatePiConfig();
                            });
                        });

                        break;
                    case "element":
                        // Check if element is a Database
                        if(srvPiConfig.assetDBs[data.ID]){
                            interface.getRootElements(srvPiConfig.idToWebId[data.ID], function(childWebId){
                                console.log("Root Elements GOT");
                                wsockets.updatePiConfig();
                            });
                        }else{
                            interface.getAttributes(srvPiConfig.idToWebId[data.ID], function(){
                                console.log("Attributes GOT");
                                wsockets.updatePiConfig();
                            });
                            interface.getChildrenElements(srvPiConfig.idToWebId[data.ID], function(childWebId){
                                console.log("Children Elements GOT");
                                wsockets.updatePiConfig();
                            });
                        }
                        break;
                    case "subscriptions":
                        subscriptions.getStreams();
                        break;
                    case "attribute":
                        break;
                    case "attributeAttributes":
                        interface.getAttributeAttributes(srvPiConfig.idToWebId[data.ID], function(childWebId){
                            console.log("Children Attributes GOT");
                            wsockets.updatePiConfig();
                        });
                        break;
                    default:
                        wsockets.log("Invalid command sent");
                        break;
                }
            }else if(data.MSGTYPE == "set"){
                switch(data.TYPE){
                    case "subscriptions":
                        subscriptions.addStream(data.ATTID);
                        break;
                    default:
                        break;
                }
            }else if(data.MSGTYPE == "remove"){
                switch(data.TYPE){
                    case "subscriptions":
                        subscriptions.removeStream(data.ATTID);
                        break;
                    default:
                        break;
                }
            }
        }catch(e){
            console.log(e);
        }
    });

    ws.on('uncaughtException', function(err) {
        ws.close();
        console.log("Some WS Error: ", err.message);
    });

    wsockets.addWS(ws);
});

module.exports = router;