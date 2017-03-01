/**
 * Created by Andres on 8/15/2016.
 */
/**
 * Created by Andres on 8/15/2016.
 */
var interface = require("./interface");


function createPIPoint(webId, callback){
    // Create Element under Parent
    var attId = srvPiConfig.webIds[webId];
    var attribute = srvPiConfig.attributes[attId];
    var serverName = srvPiConfig.elements[srvPiConfig.attributes[attId].ParentElement].Path.split('\\')[2];
    var serverId = srvPiConfig.dsNameToId[serverName];

    // Database-Name
    // LIT-SL.Element-Name.AttributeName
    var newname = srvPiConfig.elements[attribute.ParentElement].dbName + "." + srvPiConfig.elements[attribute.ParentElement].Name + "." + attribute.Name;
    //console.log("NEW NAME: " + newname);

    var data = {
        "Name": newname,
        "PointClass": "classic",
        "PointType": getRealType(attribute.Type),
        "Future": false
    };
    //console.log("NEW ATT TO SEND: ",data);

    //console.log("ATT ID, SVNAME, SERVERID: " + attId +", " +serverName + ", " + serverId)
    interface.postToApi(interface.getBaseUri() + "dataservers/" + srvPiConfig.dataServers[serverId].WebId + "/points",data, function(response, jsonbody){
        callback(response, jsonbody);
    }, function(err){
        console.log(err.stack);
    });

    function getRealType(type){
        //console.log("Getting real for Type Received: " + type);
        switch(type){
            case "blob":
            case "BooleanArray":
            case "ByteArray":
                return "blob";
            case "Int16":
            case "Boolean":
            case "Byte":
            case "Int16Array":
                return "Int16";
            case "Int32":
            case "Int32Array":
                return "Int32";
            case "Float32":
            case "Single":
            case "SingleArray":
                return "Float32";
            case "TimeStamp":
            case "DateTime":
            case "DateTimeArray":
                return "TimeStamp";
            case "Float64":
            case "Double":
            case "DoubleArray":
                return "Float64";
            default:
                return "String"; // "EnumerationValue" || "Guid" || "GuidArray" || "Int64Array" || "Int64" || "Attribute" ...
        }
    }

};

function createAttribute(parentId, data, callback){
    // Create Element under Parent
    interface.postToApi(interface.getBaseUri() + 'elements/' + srvPiConfig.idToWebId[parentId] + "/attributes",data, function(response, jsonbody){
        //jsonbody.dbName = srvPiConfig.elements[parentId].dbName;
        console.log(jsonbody)
        callback(response, jsonbody);
    }, function(err){
        console.log(err.stack);
    });
};


function getAttribute(webId, parentId, callback){
    interface.getFromApi(interface.getBaseUri() + '/attributes/' + webId, function(response, attribute){
        //console.log(response);
        srvPiConfig.attributes[attribute.Id] = attribute;
        srvPiConfig.attributes[attribute.Id].ParentElement = parentId;
        srvPiConfig.attPathToId[attribute.Path] = attribute.Id;
        srvPiConfig.webIds[attribute.WebId] = attribute.Id;
        srvPiConfig.idToWebId[attribute.Id] = attribute.WebId;
        if(!srvPiConfig.elements[parentId].Attributes)
            srvPiConfig.elements[parentId].Attributes = [];
        srvPiConfig.elements[parentId].Attributes.push(attribute.Id);
        if (attribute.Links)
            delete attribute.Links;
        callback(response, attribute);
    }, function(err){
        console.log(err);
    });
};

// Gets attributes from one WebId Element
getAttributes = function (webId, callback){
    interface.getFromApi(interface.getBaseUri() + '/elements/' + webId + '/attributes', function(response, jsonbody){
        var elementId = srvPiConfig.webIds[webId];
        if(!srvPiConfig.webIds[webId])
            console.log("Get Elements before requesting Attributes");
        if(srvPiConfig.elements[elementId]){
            if(!srvPiConfig.elements[elementId].Attributes)
                srvPiConfig.elements[elementId].Attributes = [];
            srvPiConfig.elements[elementId].AttributesLength = jsonbody.Items.length;
        }

        for(var i in jsonbody.Items){
            var element = jsonbody.Items[i];
            srvPiConfig.attributes[element.Id] = element;
            srvPiConfig.attributes[element.Id].ParentElement = elementId;
            srvPiConfig.elements[elementId].Attributes.push(element.Id);
            srvPiConfig.attPathToId[element.Path] = element.Id;
            srvPiConfig.webIds[element.WebId] = element.Id;
            srvPiConfig.idToWebId[element.Id] = element.WebId;
            if (element.Links)
                delete element.Links;
            callback(response, element);
        }
    }, function(err){
        console.log(err);
    });
};

exports.createPIPoint = createPIPoint;
exports.createAttribute = createAttribute;
exports.getAttribute = getAttribute;
exports.getAttributes = getAttributes;