/**
 * Created by Yuyin on 13-03-2016.
 */
var request = require('request');
var subscriptions = require("./subscriptions");

var credentials = {};
let initialPiconfig = {
    dataServers: {},
    assetServers: {},
    assetDBs: {},
    elementTemplates: {},
    elements: {},
    eventFrames: {},
    attributes: {},
    pathTree: {},
    pathTreeArray: [],
    attPathToId: {},
    webIds: {},
    idToWebId: {},
    dbNameToId: {},
    dsNameToId: {}
};

// As function to allow realtime config change
var getBaseUri = function(){return baseuri = "https://" + srvConfig.webapi_host + "/piwebapi/";};

exports.start = function(){

    if(!srvPiConfig || JSON.stringify(srvPiConfig) == "{}"){
        srvPiConfig = initialPiconfig;
    }

    credentials = {
        user: srvConfig.username,
        pass: srvConfig.password,
        sendImmediately: true
    };

    console.log("Credentials Loaded: ", credentials);

    //getAllFromApi();
    subscriptions.start();
};


function getFromApi(path, successCallback, errorCallback){
    request.get(path, {
        auth: credentials,
        strictSSL: false,
    }, function(error, response, body) {
        if(error){
            errorCallback(error);
        }
        else{
            console.log(response.statusCode);
            try{
                var jsonBody = {};
                if(body == ""){
                    jsonBody.statusCode = "201";
                }else{
                    jsonBody = JSON.parse(body);
                }
                jsonBody.statusCode = response.statusCode;
                successCallback(response, jsonBody);
            }catch(e){
                console.log("Error on successCallback after successful getFromApi(" + path + ") response");
                errorCallback(e.stack);
            }
        }
    });
}
function postToApi(path, data, successCallback, errorCallback){
    console.log(path);

    var options = {
        url: path,
        method: "POST",
        timeout: 10000,
        followRedirect: true,
        maxRedirects: 10,
        strictSSL: false,
        auth: credentials,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    request(options, function(error, response, body) {
        if(error){
            errorCallback(error);
        }
        else{
            console.log(response.statusCode);
            try{
                //console.log(response)
                //console.log(response)
                var jsonBody = {};
                if(body == ""){
                    jsonBody.statusCode = "201";
                }else{
                    jsonBody = JSON.parse(body);
                }
                jsonBody.statusCode = response.statusCode;
                successCallback(response, jsonBody);
            }catch(e){
                console.log("Error on successCallback after successful postFromApi(" + path + ") response");
                errorCallback(e.stack);
            }
        }
    });
}

var waitingDataServers = 0;
getDataServers = function (callback){
    getFromApi(getBaseUri() + 'dataservers', function(response, jsonbody){
        waitingDataServers = jsonbody.Items.length;
        jsonbody.Items.forEach(function(element) {
            srvPiConfig.dataServers[element.Id] = element;
            srvPiConfig.webIds[element.WebId] = element.Id;
            srvPiConfig.idToWebId[element.Id] = element.WebId;
            srvPiConfig.dsNameToId[element.Name] = element.Id;
            callback(srvPiConfig.dataServers[element.Id].WebId, --waitingDataServers);
        });
    }, function(err){
        console.log(err);
    });
};

var waitingAssetServers = 0;
getAssetServers = function (callback){
    getFromApi(getBaseUri() + 'assetservers', function(response, jsonbody){
        console.log(jsonbody)
        if(jsonbody.Items)
            jsonbody.Items.forEach(function(element) {
                srvPiConfig.assetServers[element.Id] = element;
                srvPiConfig.elements[element.Id] = element; //TODO: VERIFY
                srvPiConfig.webIds[element.WebId] = element.Id;
                srvPiConfig.idToWebId[element.Id] = element.WebId;
                callback(srvPiConfig.assetServers[element.Id].WebId, --waitingAssetServers);
            });
    }, function(err){
        console.log(err);
    });
};

var waitingDBs = 0;
getDataBases = function (webId, callback){
    getFromApi(getBaseUri() + 'assetservers/' + webId + '/assetdatabases', function(response, jsonbody){
        if(jsonbody && jsonbody.Items)
            waitingDBs = jsonbody.Items.length;
        else{
            console.log("Empty Database in Server: " + srvPiConfig.assetServers[srvPiConfig.webIds[webId]].Name);
            return;
        }
        jsonbody.Items.forEach(function(element) {
            srvPiConfig.dbNameToId[element.Name] = element.Id;
            srvPiConfig.assetDBs[element.Id] = element;
            srvPiConfig.elements[element.Id] = element; //TODO: VERIFY
            srvPiConfig.webIds[element.WebId] = element.Id;
            srvPiConfig.idToWebId[element.Id] = element.WebId;
            if(element.Links)
                delete element.Links;
            callback(srvPiConfig.assetDBs[element.Id].WebId, --waitingDBs);
        });
    }, function(err){
        console.log(err);
    });
};


exports.getRootElements = function (webId, callback){
    getFromApi(getBaseUri() + '/assetdatabases/' + webId + '/elements', function(response, jsonbody){
        jsonbody.Items.forEach(function(element) {
            srvPiConfig.elements[element.Id] = element;
            srvPiConfig.webIds[element.WebId] = element.Id;
            srvPiConfig.idToWebId[element.Id] = element.WebId;

            if(element.Links)
                delete element.Links;

            if(jsonbody.Items.length == 0){
                console.log("No Root Elements on DB");
            }else{
                console.log("Root Elements on DB: " + jsonbody.Items.length);
            }

            if(callback)
                callback(element.WebId);
        });
    }, function(err){
        console.log(err);
    });
};

getRootTemplates = function (webId){
    getFromApi(getBaseUri() + '/assetdatabases/' + webId + '/elementtemplates', function(response, jsonbody){
        jsonbody.Items.forEach(function(element) {
            srvPiConfig.elementTemplates[element.Id] = element;
            srvPiConfig.webIds[element.WebId] = element.Id;
            srvPiConfig.idToWebId[element.Id] = element.WebId;
            if(element.Links)
                delete element.Links;
            console.log(element)
        });
    }, function(err){
        console.log(err);
    });
};


getEventFrames = function (webId){
    getFromApi(getBaseUri() + '/elements/' + webId + '/eventframes', function(response, jsonbody){
        jsonbody.Items.forEach(function(element, key) {
            srvPiConfig.eventFrames[element.Id] = element;
            srvPiConfig.webIds[element.WebId] = element.Id;
            srvPiConfig.idToWebId[element.Id] = element.WebId;
            if(element.Links)
                delete element.Links;
        });
    }, function(err){
        console.log(err);
    });
};

var waitingForElements = false;
var unvisitedWithChildren = 0;
var recursiveElement = function(elementWebId, callback){
    //console.log("rec element")
    getFromApi(getBaseUri() + '/elements/' + elementWebId + '/elements', function(rename, jsonbody){
        unvisitedWithChildren += jsonbody.Items.length;
        jsonbody.Items.forEach(function(element, key) {
            element.dbName = element.Path.split("\\")[3];
            //console.log(element.dbName)
            srvPiConfig.elements[element.Id] = element;
            srvPiConfig.webIds[element.WebId] = element.Id;
            srvPiConfig.idToWebId[element.Id] = element.WebId;
            if(element.Links)
                delete element.Links;
            if(element.HasChildren == true){
                totalElements++;
                recursiveElement(element.WebId, callback);
            }else{
                unvisitedWithChildren--;
                if(unvisitedWithChildren <= 0){
                    waitingForElements = false;
                }
                totalElements++;
                //Callback executed at the end of all request
                callback(srvPiConfig.elements[element.Id].WebId, srvPiConfig.elements[element.Id].Name);
            }
        });
    }, function(err){
        console.log(err);
    });
};

var totalElements = 0;
getAllElements = function (webId, callback){
    console.log("all elem for DB: " + webId)
    // First request for RootElements is different than other requests, thats why is separated recursiveElementFunction.
    waitingForElements = true;
    unvisitedWithChildren = 0; // To avoid problems due to latency, make it think is waiting
    getFromApi(getBaseUri() + '/assetdatabases/' + webId + '/elements', function(response, jsonbody){
        // Initial visiting node value
        unvisitedWithChildren = jsonbody.Items.length;
        //totalElements += jsonbody.Items.length;
        jsonbody.Items.forEach(function(element, key) {
            //console.log("checking element:" + JSON.stringify(element, null, '\t'));
            element.dbName = element.Path.split("\\")[3];
            srvPiConfig.elements[element.Id] = element;
            srvPiConfig.webIds[element.WebId] = element.Id;
            srvPiConfig.idToWebId[element.Id] = element.WebId;
            if(element.Links)
                delete element.Links;
            if(element.HasChildren == true) {
                totalElements++;
                recursiveElement(element.WebId, callback);
            }
            else {
                unvisitedWithChildren--;
                if(unvisitedWithChildren <= 0){
                    waitingForElements = false;
                }
                totalElements++;
                callback(srvPiConfig.elements[element.Id].WebId, srvPiConfig.elements[element.Id].Name);
            }
        });
    }, function(err){
        console.log(err);
    });
};

exports.getChildrenElements = function (webId, callback){
    console.log("Children elems: " + webId)
    // First request for RootElements is different than other requests, thats why is separated recursiveElementFunction.
    waitingForElements = true;
    getFromApi(getBaseUri() + '/elements/' + webId + '/elements', function(response, jsonbody){
        // Initial visiting node value
        if(jsonbody.statusCode != 200 && jsonbody.statusCode != 201){
            console.log("No Children elements found");
            console.log(jsonbody);

            return;
        }
        if(jsonbody.Items.length == 0){
            console.log("No Child Elements on Element");
        }else{
            console.log("Child Elements: " + jsonbody.Items.length);
        }
        totalElements += jsonbody.Items.length;
        jsonbody.Items.forEach(function(element, key) {
            //console.log("checking element:" + JSON.stringify(element, null, '\t'));
            element.dbName = element.Path.split("\\")[3];
            srvPiConfig.elements[element.Id] = element;
            srvPiConfig.webIds[element.WebId] = element.Id;
            srvPiConfig.idToWebId[element.Id] = element.WebId;
            if(element.Links)
                delete element.Links;

            callback(srvPiConfig.elements[element.Id].WebId, srvPiConfig.elements[element.Id].Name);
        });
    }, function(err){
        console.log(err);
    });
};


// Gets attributes from one WebId Element
var completeElements = 0;
var receivedAttributes = 0;
getAttributes = function (webId, callback){

    let attributeCount = 0;
    let attributesChecked = 0;
    if(!webId){
        return;
    }
    else{
        getFromApi(getBaseUri() + '/elements/' + webId + '/attributes', function(response, jsonbody){
            if(jsonbody.statusCode != 200 && jsonbody.statusCode != 201){
                console.log("Error Retrieving Attributes");
                console.log(webId)
                console.log(jsonbody);
                callback("");
                return;
            }
            attributeCount = jsonbody.Items.length;

            if(jsonbody.Items.length == 0){
                console.log("No Attributes on Element");
                completeElements++;
                callback("");
                return;
            }

            var elementId = srvPiConfig.webIds[webId];
            if(!srvPiConfig.webIds[webId])
                console.log("Get Elements before requesting Attributes");
            if(srvPiConfig.elements[elementId]){
                //if(!srvPiConfig.elements[elementId].Attributes)
                srvPiConfig.elements[elementId].Attributes = [];
                srvPiConfig.elements[elementId].AttributesLength = jsonbody.Items.length;
            }


            jsonbody.Items.forEach(function (element, key) {
                srvPiConfig.attributes[element.Id] = element;
                srvPiConfig.attributes[element.Id].ParentElement = elementId;
                srvPiConfig.elements[elementId].Attributes.push(element.Id);
                srvPiConfig.attPathToId[element.Path] = element.Id;
                srvPiConfig.webIds[element.WebId] = element.Id;
                srvPiConfig.idToWebId[element.Id] = element.WebId;
                if (element.Links)
                    for(link in element.Links)
                        getAttributes(link.WebId, function(){})
                    delete element.Links;
                attributesChecked++;
                //console.log("Atts checked: " + attributesChecked + " attributeCount of element: " + attributeCount)
                //callback(element.Path, --waitingAttributes);
                if(attributesChecked == attributeCount){
                    completeElements++;
                    callback(element.WebId);
                }
            });
        }, function(err){
            console.log(err);
        });
    }
};

// Gets attributes from one WebId Attribute
getAttributeAttributes = function (webId, callback){

    let attributeCount = 0;
    let attributesChecked = 0;
    getFromApi(getBaseUri() + '/attributes/' + webId + '/attributes', function(response, jsonbody){
        if(jsonbody.statusCode != 200 && jsonbody.statusCode != 201){
            console.log("Error Retrieving AttAttributes");
            console.log(jsonbody);
            callback();
            return;
        }
        attributeCount = jsonbody.Items.length;
        var attributeId = srvPiConfig.webIds[webId];
        var elementId = srvPiConfig.attributes[attributeId].ParentElement;

        if(!srvPiConfig.webIds[webId])
            console.log("Get Elements before requesting Attributes");

            
        if(jsonbody.Items.length == 0){
            console.log("No Attributes on Attribute");
            callback();
            return;
        }else{
            srvPiConfig.attributes[attributeId].HasChildren = true;
        }
        if(srvPiConfig.elements[elementId]){
            if(!srvPiConfig.elements[elementId].Attributes)
                srvPiConfig.elements[elementId].Attributes = [];
            srvPiConfig.elements[elementId].AttributesLength += jsonbody.Items.length;
        }


        jsonbody.Items.forEach(function (element, key) {
            srvPiConfig.attributes[element.Id] = element;
            srvPiConfig.attributes[element.Id].ParentElement = elementId;
            srvPiConfig.elements[elementId].Attributes.push(element.Id);
            srvPiConfig.attPathToId[element.Path] = element.Id;
            srvPiConfig.webIds[element.WebId] = element.Id;
            srvPiConfig.idToWebId[element.Id] = element.WebId;
            if (element.Links)
                for(link in element.Links)
                    getAttributes(link.WebId, function(){})
                delete element.Links;
            attributesChecked++;
            //callback(element.Path, --waitingAttributes);
            if(attributesChecked == attributeCount)
                callback(element.WebId);
        });
    }, function(err){
        console.log(err);
    });
};

// Get all Attributes of all Elements, only if All elements are present
getAllAttributes = function(){
    console.log("all att")
    waitingAttributes = 0;
    Object.keys(srvPiConfig.elements).forEach(function(keyName){
        getAttributes(srvPiConfig.elements[keyName].WebId, function(){});
    });
};

// After all Elements are ready, will Generate the srvPiConfig.pathTree and add Id to the TreeNode if its an Element
genElementTree = function(callback){
    //Get the Element
    srvPiConfig.pathTree = {};
    srvPiConfig.pathTreeArray = [];
    //console.log("Generating Element Tree");
    if(srvPiConfig && srvPiConfig.elements)
    Object.keys(srvPiConfig.elements).forEach(function(keyName, key){
        //Go through the Path compontens
        var pathList = srvPiConfig.elements[keyName].Path.split('\\');

        addNode = function(parentNode, nodeNameIndex) {
            var nodeName = pathList[nodeNameIndex];
            if(nodeName == ""){
                nodeName = "PI Servers";
            }
            if (!parentNode[nodeName]) {
                parentNode[nodeName] = {};
            }

            if (nodeNameIndex < pathList.length - 1)
                addNode(parentNode[nodeName], nodeNameIndex + 1);
            else // When reaching this end Node
                parentNode[nodeName].Id = srvPiConfig.elements[keyName].Id;
        };

        if(pathList.length > 1)
            addNode(srvPiConfig.pathTree, 1);
        if(key == Object.keys(srvPiConfig.elements).length-1){
            objtoarray(srvPiConfig.pathTree, srvPiConfig.pathTreeArray);
            if(callback)
                callback();
        }
    });
};

var nodeIdCounter = 0;
objtoarray = function(parentNode, parentArray){
    Object.keys(parentNode).forEach(function(keyName){

        if(typeof parentNode[keyName] === 'object'){
            var arrayElement = {};
            //console.log("Source Name: " + keyName);
            arrayElement.title = keyName;
            arrayElement.nodeId = ++nodeIdCounter;
            arrayElement.Id = parentNode[keyName].Id;
            arrayElement.nodes = [];
            //arrayElement.node.push(parentNode[keyName]);
            //console.log("NODE ID COUNTER: " + nodeIdCounter)
            parentArray.push(arrayElement);

            objtoarray(parentNode[keyName], arrayElement.nodes);
        }
    });
};

let elementsChecked=0;
getAllFromApi = function(callback){
    srvPiConfig = initialPiconfig;
    getAssetServers(function(asWebId, pendingAServers){
        //console.log("Pending AS: " + pendingAServers);
        completeElements=0;
        getDataBases(asWebId, function(dbWebId, pendingDBs){
            console.log("getdatabases callback")
            getAllElements(dbWebId, function(elWebId, elName){
                
                console.log("getallelements callback")
                //console.log(Object.keys(srvPiConfig.elements).length);
                getAttributes(elWebId, function(attName){
                    //console.log("Done AttRequests: " + attName)
                    //console.log(waitingAttributes);
                    //console.log("Complete Elements: " + completeElements + " Checked Elements: " + elementsChecked)
                    console.log(" Checked Elements: " + completeElements)
                    console.log("Total Elements: " + totalElements)
                    //console.log(elementsChecked)
                    //console.log(Object.keys(srvPiConfig.elements).length)
                    if(elementsChecked == Object.keys(srvPiConfig.elements).length){
                        console.log("DONE")
                    }
                });
                //console.log("Element Requested: " + elName);
            });
        });
    });
    getDataServers(function(dsWebId, pendingDServers){
        console.log("DataServer ok: " + pendingDServers);
    });
}

function updateSubs(){
    subscriptions.getStreams();
}


exports.genElementTree = genElementTree;
exports.getDataBases = getDataBases;
exports.getBaseUri = getBaseUri;
exports.updateSubs = updateSubs;
exports.getAllFromApi = getAllFromApi;
exports.getAssetServers = getAssetServers;
exports.getFromApi = getFromApi;
exports.getAttributes = getAttributes;
exports.getAttributeAttributes = getAttributeAttributes;
exports.initialPiconfig = initialPiconfig;