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

    console.log("Credentials Loaded Interface2: ", credentials);
};


function getFromApi(path, successCallback, errorCallback){
    console.log(path)
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

getAssetServers = function (callback){
    var totalAssetServers = 0;
    getFromApi(getBaseUri() + 'assetservers', function(response, jsonbody){
        if(jsonbody.Items)
            totalAssetServers = jsonbody.Items.length;
            console.log("Asset Servers: " + totalAssetServers)
            jsonbody.Items.forEach(function(element) {
                if(element.Links)
                    delete element.Links
                srvPiConfig.assetServers[element.Id] = element;
                srvPiConfig.elements[element.Id] = element; //TODO: VERIFY
                srvPiConfig.webIds[element.WebId] = element.Id;
                srvPiConfig.idToWebId[element.Id] = element.WebId;
                totalAssetServers--;
                //if(totalAssetServers == 0)
                callback(srvPiConfig.assetServers[element.Id].WebId, totalAssetServers);
            });
    }, function(err){
        console.log(err);
    });
};


getDataBases = function (webId,dbid, callback){
    getFromApi(getBaseUri() + 'assetservers/' + webId + '/assetdatabases', function(response, jsonbody){
        let totalDBs = 0;
        console.log(jsonbody)     
        if(jsonbody && jsonbody.Items){
            totalDBs = jsonbody.Items.length;   
            jsonbody.Items.forEach(function(element) {
                srvPiConfig.dbNameToId[element.Name] = element.Id;
                srvPiConfig.assetDBs[element.Id] = element;
                srvPiConfig.elements[element.Id] = element; //TODO: VERIFY
                srvPiConfig.webIds[element.WebId] = element.Id;
                srvPiConfig.idToWebId[element.Id] = element.WebId;
                if(element.Links)
                    delete element.Links;
                totalDBs--;
                if(dbid == element.Id){
                    callback(srvPiConfig.assetDBs[element.Id].WebId, totalDBs);
                }
            });
        }
        else{
            console.log("Empty Database in Server: " + srvPiConfig.assetServers[srvPiConfig.webIds[webId]].Name);
        }
    }, function(err){
        console.log(err);
    });
};

getDataBases2 = function (webId, callback){
    getFromApi(getBaseUri() + 'assetservers/' + webId + '/assetdatabases', function(response, jsonbody){
        let totalDBs = 0;
        console.log(jsonbody)     
        if(jsonbody && jsonbody.Items){
            totalDBs = jsonbody.Items.length;   
            jsonbody.Items.forEach(function(element) {
                srvPiConfig.dbNameToId[element.Name] = element.Id;
                srvPiConfig.assetDBs[element.Id] = element;
                srvPiConfig.elements[element.Id] = element; //TODO: VERIFY
                srvPiConfig.webIds[element.WebId] = element.Id;
                srvPiConfig.idToWebId[element.Id] = element.WebId;
                if(element.Links)
                    delete element.Links;
                totalDBs--;
                if(totalDBs == 0){
                    callback(srvPiConfig.assetDBs[element.Id].WebId, totalDBs);
                }
            });
        }
        else{
            console.log("Empty Database in Server: " + srvPiConfig.assetServers[srvPiConfig.webIds[webId]].Name);
        }
    }, function(err){
        console.log(err);
    });
};


getRootElements = function (webId, callback){
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

var recursiveElement = function(dbWebId, url, callback){
    //console.log("rec element")
    getFromApi(url, function(response, jsonbody){

        if(jsonbody.Items){
            totalElements[dbWebId] += jsonbody.Items.length;
        }
        else{
            console.log(jsonbody)
            return
        }
        doneItems[dbWebId]++;// Response received
        // Sumo elementos de cada elemento
        jsonbody.Items.forEach(function(element, key) {
            let newLinks = element.Links;
            if(element.Links){
                delete element.Links
            }
            element.dbName = element.Path.split("\\")[3];
            srvPiConfig.elements[element.Id] = element;
            srvPiConfig.webIds[element.WebId] = element.Id;
            srvPiConfig.idToWebId[element.Id] = element.WebId;
            console.log("Current Element:"+element.Path)
            console.log("Total Elements:"+totalElements[dbWebId] + " Done Elements: " + doneItems[dbWebId])
            
            if(element.WebId)
                delete element.WebId
            if(element.HasChildren == true){
                recursiveElement(dbWebId, newLinks.Elements, callback)
            }
            else
                callback();// Es un fin del arbol
        });
    }, function(err){
        console.log(err);
    });
};

let totalElements={};
let doneItems={};

getAllElementsOfDB = function (webId, callback){
    console.log("all elem for DB: " + webId)
    getFromApi(getBaseUri() + '/assetdatabases/' + webId + '/elements', function(response, jsonbody){
        if(!jsonbody.Items || jsonbody.Items.length == 0)
            callback()
        // Sumo elementos del root
        totalElements[webId] = jsonbody.Items.length;
        doneItems[webId] = 0;
        // Si es que no hay Items es porque no existen elementos
        jsonbody.Items.forEach(function(element, key) {
            let newLinks = element.Links;
            if(element.Links){
                delete element.Links
            }
            element.dbName = element.Path.split("\\")[3];
            srvPiConfig.elements[element.Id] = element;
            srvPiConfig.webIds[element.WebId] = element.Id;
            srvPiConfig.idToWebId[element.Id] = element.WebId;

            console.log("Current Element:"+element.Path)
            console.log("Total Elements:"+totalElements[webId] + " Done Elements: " + doneItems[webId])
            
            if(element.WebId)
                delete element.WebId
                
            if(newLinks && newLinks.Elements){
                if(element.HasChildren == true){
                    recursiveElement(webId, newLinks.Elements, function(){
                        doneItems[webId]++;
                        if(doneItems[webId] == totalElements[webId]){
                            console.log("Total Elements:"+totalElements[webId] + " Done Elements: " + doneItems[webId])
                            console.log("DONE!")
                            console.log(srvPiConfig.elements)
                            callback();
                        }
                    });
                }
                else{
                    if(doneItems[webId] == totalElements[webId])
                        console.log("DONE!")
                }
            }

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
                if(callback)
                    callback("");
                return;
            }
            attributeCount = jsonbody.Items.length;

            if(jsonbody.Items.length == 0){
                console.log("No Attributes on Element: " + srvPiConfig.elements[srvPiConfig.webIds[webId]].Name);
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
                    callback(element.Id);
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
                callback(elementId);
        });
    }, function(err){
        console.log(err);
    });
};

// Get all Attributes of all Elements, only if All elements are present
getAllAttributes = function(callback){
    console.log("all att")
    waitingAttributes = 0;
    let remainingElements = Object.keys(srvPiConfig.elements).length;
    Object.keys(srvPiConfig.elements).forEach(function(keyName){
        getAttributes(srvPiConfig.elements[keyName].WebId, function(){
            remainingElements--;
            console.log("Remaining Elements: " + remainingElements);
            if(remainingElements <= 0){
                callback();
            }
        });
    });
};


// Gets all asset servers and all databases inside each one.
// For each database will check if it is the specified id, then will get all elements inside too.
getAllFromAF = function(af_dbid, callback){
    srvPiConfig = initialPiconfig;
    getAssetServers(function(asWebId, totalAssetServers){
        console.log("Asset Servers webId: " + asWebId)
        getDataBases(asWebId, af_dbid, function(dbWebId, totalDBs){
            getAllElementsOfDB(dbWebId, function(){
                console.log("Final callback");
                callback();
            });
        });
    }, function(err){
        callback(err);
    });
    /*getDataServers(function(dsWebId, pendingDServers){
        console.log("DataServer ok: " + pendingDServers);
    });*/
}


// Gets attributes from one WebId Attribute

// Ver: 
//https://techsupport.osisoft.com/Documentation/PI-Web-API/help/controllers/stream/actions/getrecorded.html
//https://techsupport.osisoft.com/Documentation/PI-Web-API/help/controllers/streamset/actions/getrecordedattime.html
//https://techsupport.osisoft.com/Documentation/PI-Web-API/help/controllers/stream/actions/getsummary.html
//CHECK THIS
//https://techsupport.osisoft.com/Documentation/PI-Web-API/help/topics/time-strings.html
getSensorData = function (webId, startTime, endTime, callback){

    let attributeCount = 0;
    let attributesChecked = 0;
    //let params = `?webId=${webId}&time=${time}&selectedFields=Items.Value.Timestamp;Items.Value.Value`; //&selectedFields=Items.Value.Timestamp;Items.Value.Value
    let params = `?startTime=${startTime}&endTime=${endTime}&selectedFields=Items.Value.Timestamp;Items.Value.Value;Items.Timestamp`;
    //let url = getBaseUri() + 'streamsets/value'+params;
    let url = getBaseUri() + 'streams/' + webId + '/recorded'+params; // se permite tambien un summary
    console.log(url)
    //getFromApi(getBaseUri() + '/streamsets/' + webId + '/recordedattimes'+params, function(response, jsonbody){
    getFromApi(url, function(response, jsonbody){
        console.log(response.body);
        callback(jsonbody);
    }, function(err){
        console.log(err);
    });
};

getSensorDataSingle = function (webId, time,retrievalMode, callback){

    let attributeCount = 0;
    let attributesChecked = 0;
    //let params = `?webId=${webId}&time=${time}`;//&selectedFields=Items.Value.Timestamp;Items.Value.Value;
    //let url = getBaseUri() + 'streamsets/value'+params;
    let params = `?time=${time}&retrievalMode=${retrievalMode}&selectedFields=Timestamp;Value;UnitsAbbreviation`;//&selectedFields=Items.Value.Timestamp;Items.Value.Value;Items.Timestamp
    let url = getBaseUri() + 'streams/' + webId + '/recordedattime'+params;
    console.log(url)
    //getFromApi(getBaseUri() + '/streamsets/' + webId + '/recordedattimes'+params, function(response, jsonbody){
    getFromApi(url, function(response, jsonbody){
        console.log(response.body);
        callback(jsonbody);
    }, function(err){
        console.log(err);
    });
};

// Typos de summary: https://techsupport.osisoft.com/Documentation/PI-Web-API/help/topics/summary-type.html
getSensorDataSummary = function (webId, startTime, endTime, grouptime, summaryType,sampleType, sampleInterval, filerExpression, callback){
    let params = "";
    let url = "";
    if(Array.isArray(webId)){
        params = `?startTime=${startTime}&endTime=${endTime}&summaryDuration=${grouptime}&selectedFields=Items.Name;Items.Items.Type;Items.Items.Value.Timestamp;Items.Items.Value.Value;`;//
        if(sampleType == "Interval"){
            params += `&sampleType=${sampleType}`
            if(sampleInterval){
                params += `&sampleInterval=${sampleInterval}`
            }
        }
        if(filerExpression){
            params += `&filerExpression=${filerExpression}`
        }

        for(let i in webId){
            params += `&webId=${webId[i]}`
        }
    }else{
        //let params = `?webId=${webId}&time=${time}&selectedFields=Items.Value.Timestamp;Items.Value.Value`; //&selectedFields=Items.Value.Timestamp;Items.Value.Value
        params = `?startTime=${startTime}&endTime=${endTime}&summaryDuration=${grouptime}&webId=${webId}&selectedFields=Items.Name;Items.Items.Type;Items.Items.Value.Timestamp;Items.Items.Value.Value;`;
        //let url = getBaseUri() + 'streamsets/value'+params;
        //getFromApi(getBaseUri() + '/streamsets/' + webId + '/recordedattimes'+params, function(response, jsonbody){
    }

    if(Array.isArray(summaryType)){
        for(let i in summaryType){
            params += `&summaryType=${summaryType[i]}`
        }
    }else{
        params += `&summaryType=${summaryType}`
    }
    url = getBaseUri() + 'streamsets/summary'+params; // se permite tambien un summary
    console.log("QUERY TO SEND: " + url)
    getFromApi(url, function(response, jsonbody){
        console.log(response.body);
        callback(jsonbody);
    }, function(err){
        console.log(err);
    });
};

getSearchQuery = function ( q, scope, fields, count, start, callback){

    let attributeCount = 0;
    let attributesChecked = 0;
    //let params = `?webId=${webId}&time=${time}&selectedFields=Items.Value.Timestamp;Items.Value.Value`; //&selectedFields=Items.Value.Timestamp;Items.Value.Value
    
    let params = `?q=${q}`
    if(scope)
        params +=`&scope=${scope}`
    if(fields)
        params +=`&fields=${fields}`
    if(count)
        params +=`&count=${count}`
    if(start)
        params +=`&start=${start}`
    //let url = getBaseUri() + 'streamsets/value'+params;
    let url = getBaseUri() + 'search/query'+params; // se permite tambien un summary
    console.log(url)
    //getFromApi(getBaseUri() + '/streamsets/' + webId + '/recordedattimes'+params, function(response, jsonbody){
    getFromApi(url, function(response, jsonbody){
        console.log(response.body);
        callback(jsonbody);
    }, function(err){
        console.log(err);
    });
};

exports.getSearchQuery = getSearchQuery;
exports.getSensorDataSingle = getSensorDataSingle;
exports.getSensorData = getSensorData;
exports.getSensorDataSummary = getSensorDataSummary;
exports.genElementTree = genElementTree;
exports.getBaseUri = getBaseUri;
exports.getDataBases2 = getDataBases2;
exports.getAllFromAF = getAllFromAF;
exports.getAssetServers = getAssetServers;
exports.getFromApi = getFromApi;
exports.getAttributes = getAttributes;
exports.getAllAttributes = getAllAttributes;
exports.getAttributeAttributes = getAttributeAttributes;
exports.initialPiconfig = initialPiconfig;